import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdmin } from '../../../../src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    // Get all system settings from the database
    const settings = await prisma.systemSetting.findMany({
      select: {
        key: true,
        value: true,
        type: true
      }
    });

    // Convert array of settings to object
    const settingsObject: Record<string, any> = {};
    
    settings.forEach(setting => {
      let parsedValue: any = setting.value;
      
      // Parse value based on type
      switch (setting.type) {
        case 'boolean':
          parsedValue = setting.value === 'true';
          break;
        case 'number':
          parsedValue = parseFloat(setting.value);
          break;
        case 'json':
          try {
            parsedValue = JSON.parse(setting.value);
          } catch {
            parsedValue = null;
          }
          break;
        // 'string' type remains as is
      }
      
      settingsObject[setting.key] = parsedValue;
    });

    return NextResponse.json({
      success: true,
      settings: settingsObject
    });

  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const settings = await request.json();

    // Define setting types for proper storage
    const settingTypes: Record<string, string> = {
      // Company Information
      companyName: 'string',
      companyEmail: 'string',
      companyPhone: 'string',
      companyAddress: 'string',
      companyWebsite: 'string',
      
      // Platform Settings
      platformName: 'string',
      supportEmail: 'string',
      defaultLanguage: 'string',
      defaultCurrency: 'string',
      
      // Email Settings
      smtpHost: 'string',
      smtpPort: 'string',
      smtpUser: 'string',
      smtpPassword: 'string',
      smtpFromEmail: 'string',
      smtpFromName: 'string',
      
      // System Settings
      maintenanceMode: 'boolean',
      userRegistration: 'boolean',
      emailVerification: 'boolean',
      maxPropertiesPerUser: 'number',
      maxFileSizeMB: 'number',
      
      // Security Settings
      sessionTimeoutMinutes: 'number',
      passwordMinLength: 'number',
      requireSpecialCharacters: 'boolean',
      maxLoginAttempts: 'number',
      
      // Notification Settings
      emailNotifications: 'boolean',
      pushNotifications: 'boolean',
      smsNotifications: 'boolean',
      adminNotifications: 'boolean',
      
      // AI Chatbot Settings
      chatbotEnabled: 'boolean',
      openaiApiKey: 'string',
      chatbotWelcomeMessage: 'string',
      whatsappNotifications: 'boolean'
    };

    // Process each setting
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      const type = settingTypes[key] || 'string';
      let stringValue: string;

      // Convert value to string for storage
      switch (type) {
        case 'boolean':
          stringValue = String(Boolean(value));
          break;
        case 'number':
          stringValue = String(Number(value));
          break;
        case 'json':
          stringValue = JSON.stringify(value);
          break;
        default:
          stringValue = String(value || '');
      }

      return prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: stringValue,
          type,
          updatedAt: new Date()
        },
        create: {
          key,
          value: stringValue,
          type,
          description: `System setting for ${key}`
        }
      });
    });

    await Promise.all(updatePromises);

    // Log activity - find an admin user for now
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'system_settings_updated',
          targetType: 'system',
          targetId: 'settings',
          description: 'Updated system settings',
          metadata: { 
            settingsCount: Object.keys(settings).length,
            updatedKeys: Object.keys(settings)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}