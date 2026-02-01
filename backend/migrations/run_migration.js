#!/usr/bin/env node

// Migration script to add image_url column to articles table
import { supabase } from '../src/lib/supabase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('Running migration: add_image_url_to_articles.sql');

        const sql = readFileSync(
            join(__dirname, 'add_image_url_to_articles.sql'),
            'utf-8'
        );

        // Execute the SQL using Supabase RPC
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('Migration failed:', error);
            console.log('\n⚠️  Please run this SQL manually in your Supabase SQL Editor:');
            console.log('   Dashboard → SQL Editor → New Query');
            console.log('\nSQL to run:');
            console.log('─'.repeat(50));
            console.log(sql);
            console.log('─'.repeat(50));
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');
        console.log('   Added image_url column to articles table');
    } catch (error) {
        console.error('Error running migration:', error);
        console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor');
        process.exit(1);
    }
}

runMigration();
