/**
 * Script to populate slug fields for existing properties and zones
 */

import { PrismaClient } from '@prisma/client';
import { generateSlug, generateUniqueSlug } from '../src/lib/slug-utils';

const prisma = new PrismaClient();

async function migratePropertySlugs() {
  console.log('Migrating property slugs...');
  
  const properties = await prisma.property.findMany({
    where: { slug: null },
    select: { id: true, name: true }
  });

  if (properties.length === 0) {
    console.log('No properties need slug migration');
    return;
  }

  // Get all existing slugs to ensure uniqueness
  const existingSlugs = await prisma.property.findMany({
    where: { slug: { not: null } },
    select: { slug: true }
  }).then(results => results.map(r => r.slug).filter(Boolean) as string[]);

  for (const property of properties) {
    const baseSlug = generateSlug(property.name);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
    
    await prisma.property.update({
      where: { id: property.id },
      data: { slug: uniqueSlug }
    });
    
    // Add the new slug to existing slugs to maintain uniqueness
    existingSlugs.push(uniqueSlug);
    
    console.log(`Property "${property.name}" -> slug: "${uniqueSlug}"`);
  }
  
  console.log(`Migrated ${properties.length} property slugs`);
}

async function migrateZoneSlugs() {
  console.log('Migrating zone slugs...');
  
  const zones = await prisma.zone.findMany({
    where: { slug: null },
    select: { 
      id: true, 
      name: true, 
      propertyId: true,
      property: {
        select: { name: true }
      }
    }
  });

  if (zones.length === 0) {
    console.log('No zones need slug migration');
    return;
  }

  // Group zones by property to ensure uniqueness within each property
  const zonesByProperty = zones.reduce((acc, zone) => {
    const propertyId = zone.propertyId || 'null';
    if (!acc[propertyId]) acc[propertyId] = [];
    acc[propertyId].push(zone);
    return acc;
  }, {} as Record<string, typeof zones>);

  for (const [propertyId, propertyZones] of Object.entries(zonesByProperty)) {
    // Get existing slugs for this property
    const existingSlugs = await prisma.zone.findMany({
      where: { 
        propertyId: propertyId === 'null' ? null : propertyId,
        slug: { not: null }
      },
      select: { slug: true }
    }).then(results => results.map(r => r.slug).filter(Boolean) as string[]);

    for (const zone of propertyZones) {
      // Extract the name from the JSON field (assuming it has 'es' or 'en' key)
      let zoneName = 'zone';
      if (typeof zone.name === 'object' && zone.name !== null) {
        const nameObj = zone.name as Record<string, string>;
        zoneName = nameObj.es || nameObj.en || nameObj[Object.keys(nameObj)[0]] || 'zone';
      }
      
      const baseSlug = generateSlug(zoneName);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      await prisma.zone.update({
        where: { id: zone.id },
        data: { slug: uniqueSlug }
      });
      
      // Add the new slug to existing slugs to maintain uniqueness
      existingSlugs.push(uniqueSlug);
      
      const propertyName = zone.property?.name || 'Unknown Property';
      console.log(`Zone "${zoneName}" in "${propertyName}" -> slug: "${uniqueSlug}"`);
    }
  }
  
  console.log(`Migrated ${zones.length} zone slugs`);
}

async function main() {
  try {
    await migratePropertySlugs();
    await migrateZoneSlugs();
    console.log('Slug migration completed successfully!');
  } catch (error) {
    console.error('Error during slug migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();