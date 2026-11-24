import nodemailer from 'nodemailer';
export async function POST(request: Request): Promise<Response> {
  let body: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    peopleCount?: unknown;
    category?: unknown;
    referral?: unknown;
    message?: unknown;
    consent?: unknown;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { error: 'Ungültiges Anfrageformat.' },
      { status: 400 }
    );
  }
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const peopleCount = typeof body?.peopleCount === 'string' ? body.peopleCount.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const referral = typeof body?.referral === 'string' ? body.referral.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const consent = Boolean(body?.consent);
  // 1. Validierung
  if (name.length < 2 || !email.includes('@') || message.length < 10) {
    return Response.json(
      {
        error:
          'Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und eine kurze Nachricht ein (mind. 10 Zeichen).',
      },
      { status: 400 }
    );
  }
  if (!consent) {
    return Response.json(
      {
        error: 'Bitte bestätigen Sie die Einwilligung zur Datenübermittlung.',
      },
      { status: 400 }
    );
  }
  const reference = `MS-${Date.now().toString().slice(-6)}`;
  // 2. E-Mail über Gmail SMTP (App-Passwort) versenden
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    const mailText = `Neue Kontaktanfrage über Ihre Website:
Referenz: ${reference}
Name: ${name}
E-Mail: ${email}
Telefon: ${phone || 'Keine Angabe'}
Personenanzahl: ${peopleCount || 'Keine Angabe'}
Kategorie: ${category || 'Allgemein'}
Empfehlung: ${referral || 'Keine Angabe'}
Nachricht:
${message}
`;
    await transporter.sendMail({
      from: `"Website Kontaktformular" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email, // Wenn Sie in Gmail auf "Antworten" klicken, antworten Sie direkt dem Kunden!
      subject: `Neue Anfrage (Ref: ${reference}) von ${name}`,
      text: mailText,
    });
  } catch (err) {
    console.error('Fehler beim E-Mail-Versand via Gmail:', err);
    return Response.json(
      { error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
  return Response.json(
    {
      ok: true,
      reference,
    },
    { status: 201 }
  );
}
