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
  // 1. Prüfung der Pflichtfelder
  if (name.length < 2 || !email.includes('@') || message.length < 10) {
    return Response.json(
      {
        error:
          'Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und eine kurze Nachricht ein (mind. 10 Zeichen).',
      },
      { status: 400 }
    );
  }
  // 2. Prüfung der Datenschutz-Checkbox
  if (!consent) {
    return Response.json(
      {
        error: 'Bitte bestätigen Sie die Einwilligung zur Datenübermittlung.',
      },
      { status: 400 }
    );
  }
  const reference = `MS-${Date.now().toString().slice(-6)}`;
  // 3. E-Mail im Hintergrund an Sie weiterleiten
  try {
    // HINWEIS: Ersetzen Sie 'Ihre-Email@beispiel.ch' durch Ihre echte E-Mail-Adresse!
    const MY_EMAIL = 'Ihre-Email@beispiel.ch';
    await fetch(`https://formsubmit.co/ajax/${MY_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `Neue Website-Anfrage (Ref: ${reference}) von ${name}`,
        Name: name,
        Email: email,
        Telefon: phone || 'Keine Angabe',
        Kategorie: category || 'Allgemein',
        Personen: peopleCount || 'Keine Angabe',
        Woher: referral || 'Keine Angabe',
        Nachricht: message,
      }),
    });
  } catch (err) {
    console.error('Fehler beim E-Mail-Versand:', err);
  }
  return Response.json(
    {
      ok: true,
      reference,
    },
    { status: 201 }
  );
}
