#!/usr/bin/env node

import * as ftp from "basic-ftp";

const credentials = [
  {
    name: "New Credentials",
    config: {
      host: "crossbordersmigrations.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
      port: 21,
    },
  },
  {
    name: "Original Credentials",
    config: {
      host: "crossbordersmigrations.com",
      user: "u611952859.crossborder1120",
      password: "One@click1",
      port: 21,
    },
  },
];

async function testConnection(name, config) {
  const client = new ftp.Client();
  client.timeout = 15000;

  try {
    console.log(`\n🔍 Testing ${name}...`);
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);

    await client.access(config);
    console.log("✅ Connection successful!");

    const files = await client.list();
    console.log(`📁 Found ${files.length} files/directories`);

    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  } finally {
    client.close();
  }
}

async function testAllCredentials() {
  console.log("🧪 Testing FTP credentials...");

  for (const { name, config } of credentials) {
    const success = await testConnection(name, config);
    if (success) {
      console.log(`\n🎯 Working credentials found: ${name}`);
      console.log("Ready to deploy with these credentials!");
      return config;
    }
  }

  console.log("\n❌ None of the credentials worked");
  return null;
}

testAllCredentials().then((workingConfig) => {
  if (workingConfig) {
    console.log("\n✅ FTP test completed - credentials verified");
  } else {
    console.log("\n💥 FTP test failed - no working credentials");
  }
});
