/**
 * API Route pour l'import de contacts depuis un fichier Excel (.xls, .xlsx).
 * Parse le fichier, valide les colonnes, insère les contacts et les lie à la campagne.
 * Gère la déduplication par numéro de téléphone normalisé.
 */
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { and, eq, inArray, or } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { contacts, campaignContacts, campaigns } from '@/db/schema'

type ParsedRow = Readonly<{
  firstName: string
  lastName: string
  phonePrimary: string
  phoneSecondary: string
  email: string
  schoolName: string
  desiredProgram: string
  city: string
}>

type ImportResult = Readonly<{
  ok: boolean
  imported: number
  skipped: number
  errors: readonly string[]
  message: string
}>

const normalizePhone = ({ phone }: Readonly<{ phone: string }>): string => {
  return phone.replace(/\s+/g, '').replace(/^00/, '+')
}

const findColumnValue = ({
  row,
  possibleNames,
}: Readonly<{
  row: Record<string, unknown>
  possibleNames: readonly string[]
}>): string => {
  for (const name of possibleNames) {
    const lowerName: string = name.toLowerCase()
    for (const [key, value] of Object.entries(row)) {
      if (key.toLowerCase().trim() === lowerName && value !== null && value !== undefined) {
        return String(value).trim()
      }
    }
  }
  return ''
}

const parseRow = ({ row }: Readonly<{ row: Record<string, unknown> }>): ParsedRow => {
  return {
    firstName: findColumnValue({
      row,
      possibleNames: [
        'prénom',
        'prenom',
        'firstname',
        'first_name',
        'first name',
        'nom_prenom',
        "prénom de l'élève",
        'prenom_eleve',
      ],
    }),
    lastName: findColumnValue({
      row,
      possibleNames: [
        'nom',
        'lastname',
        'last_name',
        'last name',
        'nom de famille',
        'nom_famille',
        "nom de l'élève",
        'nom_eleve',
      ],
    }),
    phonePrimary: findColumnValue({
      row,
      possibleNames: [
        'numéro de téléphone',
        'numero de telephone',
        'téléphone',
        'telephone',
        'tel',
        'phone',
        'phone_primary',
        'téléphone principal',
        'tel1',
        'numéro',
        'numero',
        'contact',
      ],
    }),
    phoneSecondary: findColumnValue({
      row,
      possibleNames: [
        'téléphone 2',
        'telephone 2',
        'tel2',
        'phone_secondary',
        'téléphone secondaire',
        'tel secondaire',
        'numéro 2',
      ],
    }),
    email: findColumnValue({
      row,
      possibleNames: ['email', 'e-mail', 'mail', 'adresse email', 'adresse_email', 'courriel'],
    }),
    schoolName: findColumnValue({
      row,
      possibleNames: [
        "établissement d'origine",
        "etablissement d'origine",
        'école',
        'ecole',
        'school',
        'school_name',
        'établissement',
        'etablissement',
        "nom de l'école",
        'nom_ecole',
        'lycée',
        'lycee',
        'collège',
        'college',
      ],
    }),
    desiredProgram: findColumnValue({
      row,
      possibleNames: [
        'filière',
        'filiere',
        'programme',
        'program',
        'desired_program',
        'filière souhaitée',
        'filiere souhaitee',
        'spécialité',
        'specialite',
        'formation',
      ],
    }),
    city: findColumnValue({
      row,
      possibleNames: ['ville', 'city', 'localité', 'localite', 'commune', 'région', 'region'],
    }),
  }
}

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 })
  }
  const formData: FormData = await request.formData()
  const file: File | null = formData.get('file') as File | null
  const campaignId: string = (formData.get('campaignId') as string | null) ?? ''
  if (!file) {
    return NextResponse.json(
      { ok: false, message: 'Aucun fichier fourni.', imported: 0, skipped: 0, errors: [] },
      { status: 400 }
    )
  }
  if (campaignId.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Veuillez sélectionner une campagne.',
        imported: 0,
        skipped: 0,
        errors: [],
      },
      { status: 400 }
    )
  }
  const campaignExists = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.id, campaignId),
        or(eq(campaigns.createdByAdminId, session.user.id), eq(campaigns.visibility, 'public'))
      )
    )
    .limit(1)
  if (campaignExists.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Campagne introuvable ou non autorisée.',
        imported: 0,
        skipped: 0,
        errors: [],
      },
      { status: 403 }
    )
  }
  const arrayBuffer: ArrayBuffer = await file.arrayBuffer()
  const data: Uint8Array = new Uint8Array(arrayBuffer)
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(data, { type: 'array' })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'Fichier Excel invalide ou corrompu.',
        imported: 0,
        skipped: 0,
        errors: [],
      },
      { status: 400 }
    )
  }
  const sheetName: string = workbook.SheetNames[0] ?? ''
  if (sheetName.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Le fichier ne contient aucune feuille.',
        imported: 0,
        skipped: 0,
        errors: [],
      },
      { status: 400 }
    )
  }
  const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName]
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet)
  if (rows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Le fichier ne contient aucune ligne de données.',
        imported: 0,
        skipped: 0,
        errors: [],
      },
      { status: 400 }
    )
  }

  // — Étape 1 : parser et valider toutes les lignes —
  type ValidRow = {
    parsed: ParsedRow
    lineNum: number
    normalized: string
    normalizedSecondary: string
  }
  const validRows: ValidRow[] = []
  let skipped: number = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const parsed: ParsedRow = parseRow({ row: rows[i] })
    if (parsed.firstName.length === 0 && parsed.lastName.length === 0) {
      errors.push(`Ligne ${i + 2} : prénom ou nom manquant.`)
      skipped++
      continue
    }
    if (parsed.phonePrimary.length === 0) {
      errors.push(`Ligne ${i + 2} : numéro de téléphone manquant.`)
      skipped++
      continue
    }
    validRows.push({
      parsed,
      lineNum: i + 2,
      normalized: normalizePhone({ phone: parsed.phonePrimary }),
      normalizedSecondary:
        parsed.phoneSecondary.length > 0 ? normalizePhone({ phone: parsed.phoneSecondary }) : '',
    })
  }

  if (validRows.length === 0) {
    const result: ImportResult = {
      ok: true,
      imported: 0,
      skipped,
      errors,
      message: `0 contact importé, ${skipped} ignoré${skipped > 1 ? 's' : ''}.`,
    }
    return NextResponse.json(result)
  }

  // — Étape 2 : trouver les contacts déjà existants en une seule requête —
  const allNormalized: string[] = validRows.map((r) => r.normalized)
  const existingContacts = await db
    .select({ id: contacts.id, normalizedPhonePrimary: contacts.normalizedPhonePrimary })
    .from(contacts)
    .where(inArray(contacts.normalizedPhonePrimary, allNormalized))

  const existingMap = new Map<string, string>(
    existingContacts.map((c) => [c.normalizedPhonePrimary, c.id])
  )

  // — Étape 3 : insérer en bulk les nouveaux contacts —
  const toInsert = validRows.filter((r) => !existingMap.has(r.normalized))
  if (toInsert.length > 0) {
    const inserted = await db
      .insert(contacts)
      .values(
        toInsert.map((r) => {
          const displayName = r.parsed.firstName.length > 0 ? r.parsed.firstName : r.parsed.lastName
          return {
            firstName: r.parsed.firstName.length > 0 ? r.parsed.firstName : displayName,
            lastName: r.parsed.lastName.length > 0 ? r.parsed.lastName : null,
            email: r.parsed.email.length > 0 ? r.parsed.email : null,
            phonePrimary: r.parsed.phonePrimary,
            phoneSecondary: r.parsed.phoneSecondary.length > 0 ? r.parsed.phoneSecondary : null,
            normalizedPhonePrimary: r.normalized,
            normalizedPhoneSecondary:
              r.normalizedSecondary.length > 0 ? r.normalizedSecondary : null,
            schoolName: r.parsed.schoolName.length > 0 ? r.parsed.schoolName : null,
            desiredProgram: r.parsed.desiredProgram.length > 0 ? r.parsed.desiredProgram : null,
            city: r.parsed.city.length > 0 ? r.parsed.city : null,
          }
        })
      )
      .returning({ id: contacts.id, normalizedPhonePrimary: contacts.normalizedPhonePrimary })

    for (const c of inserted) {
      existingMap.set(c.normalizedPhonePrimary, c.id)
    }
  }

  // — Étape 4 : insérer en bulk les liens campagne-contact —
  const campaignContactValues = validRows
    .map((r) => existingMap.get(r.normalized))
    .filter((id): id is string => id !== undefined)
    .map((contactId) => ({
      campaignId,
      contactId,
      source: 'excel_import' as const,
      importedByAdminId: session.user.id,
    }))

  if (campaignContactValues.length > 0) {
    await db.insert(campaignContacts).values(campaignContactValues).onConflictDoNothing()
  }

  const imported: number = campaignContactValues.length
  const result: ImportResult = {
    ok: true,
    imported,
    skipped,
    errors,
    message: `${imported} contact${imported > 1 ? 's' : ''} importé${imported > 1 ? 's' : ''}, ${skipped} ignoré${skipped > 1 ? 's' : ''}.`,
  }
  return NextResponse.json(result)
}
