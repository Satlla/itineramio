import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit';

const COLLECT_EMAIL_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP (5/hour)
    const rateLimitKey = getRateLimitKey(request, null, 'chatbot-email');
    const rateLimitResult = checkRateLimit(rateLimitKey, COLLECT_EMAIL_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { email, name, propertyId, sessionId, language = 'es' } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }

    if (!propertyId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get property to find the hostId
    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: { hostId: true }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Create or update Guest with tag 'chatbot'
    const guestName = name || email.split('@')[0];

    let guest = await prisma.guest.findFirst({
      where: {
        userId: property.hostId,
        email: email
      }
    });

    if (guest) {
      // Update existing guest — add chatbot tag if not present
      const currentTags = guest.tags || [];
      const newTags = currentTags.includes('chatbot')
        ? currentTags
        : [...currentTags, 'chatbot'];

      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          name: name || guest.name,
          tags: newTags
        }
      });
    } else {
      // Create new guest
      guest = await prisma.guest.create({
        data: {
          userId: property.hostId,
          email,
          name: guestName,
          tags: ['chatbot']
        }
      });
    }

    // Create or update ChatbotConversation with guest info
    const existingConversation = await prisma.chatbotConversation.findUnique({
      where: { sessionId }
    });

    if (existingConversation) {
      await prisma.chatbotConversation.update({
        where: { sessionId },
        data: {
          guestEmail: email,
          guestName: guestName,
          guestId: guest.id
        }
      });
    } else {
      await prisma.chatbotConversation.create({
        data: {
          propertyId,
          sessionId,
          language,
          guestEmail: email,
          guestName: guestName,
          guestId: guest.id,
          messages: [],
          unansweredQuestions: []
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[ChatBot] Error collecting email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
