export async function POST(request: Request): Promise<Response> {
  let body: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    peopleCount?: unknown;
    category?: unknown;
    referral?: unknown;
    message?: unknown;
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

  if (name.length < 2 || !email.includes('@') || message.length < 10) {
    return Response.json(
      {
        error:
          'Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und eine kurze Projektbeschreibung ein.',
      },
      { status: 400 }
    );
  }

  return Response.json(
    {
      ok: true,
      reference: `MS-${Date.now().toString().slice(-6)}`,
      receivedCategory: category || 'Allgemeine Anfrage',
      receivedDetails: {
        hasPhone: phone.length > 0,
        peopleCount: peopleCount || undefined,
        hasReferral: referral.length > 0,
      },
    },
    { status: 201 }
  );
}
