/**
 * Data Migration Utility
 * Use this to migrate existing localStorage data to Supabase
 * 
 * Instructions:
 * 1. Open browser developer tools
 * 2. Go to Console tab
 * 3. Copy and paste this code
 * 4. Run the migration functions
 */

// Export localStorage data to JSON
function exportLocalStorageData() {
  const kasData = localStorage.getItem('kasData');
  const anggotaData = localStorage.getItem('anggotaData');
  
  const exportData = {
    kas: kasData ? JSON.parse(kasData) : [],
    anggota: anggotaData ? JSON.parse(anggotaData) : [],
    exportDate: new Date().toISOString()
  };
  
  // Download as JSON file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `gcp-data-export-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  console.log('Data exported successfully!');
  console.log('Kas records:', exportData.kas.length);
  console.log('Anggota records:', exportData.anggota.length);
  
  return exportData;
}

// Import data to Supabase (requires being logged in to the app)
async function importDataToSupabase(exportedData) {
  // Check if we're in the app context
  if (typeof window === 'undefined' || !window.location.pathname.includes('localhost:3000')) {
    console.error('This function should be run in your Next.js app context');
    return;
  }
  
  try {
    // Import kas data
    console.log('Importing kas data...');
    for (const kas of exportedData.kas) {
      const kasData = {
        keterangan: kas.keterangan,
        jumlah: kas.jumlah,
        jenis: kas.jenis,
        kategori: kas.kategori,
        tanggal: kas.tanggal
      };
      
      // You would call your KasService.create() here
      // await KasService.create(userId, kasData);
      console.log('Would import kas:', kasData);
    }
    
    // Import anggota data
    console.log('Importing anggota data...');
    for (const anggota of exportedData.anggota) {
      const anggotaData = {
        nama: anggota.nama,
        email: anggota.email,
        nickname: anggota.nickname,
        telepon: anggota.telepon,
        role: anggota.role,
        status: anggota.status,
      };
      
      // You would call your AnggotaService.create() here
      // await AnggotaService.create(userId, anggotaData);
      console.log('Would import anggota:', anggotaData);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Clear localStorage after successful migration
function clearLocalStorageData() {
  const confirm = window.confirm('Are you sure you want to clear localStorage? This action cannot be undone.');
  if (confirm) {
    localStorage.removeItem('kasData');
    localStorage.removeItem('anggotaData');
    console.log('localStorage cleared successfully!');
  }
}

// Usage instructions
console.log(`
=== Data Migration Utility ===

To migrate your data from localStorage to Supabase:

1. Export your localStorage data:
   exportLocalStorageData()

2. Set up Supabase following the SUPABASE_SETUP.md guide

3. Login to your app and open the console

4. Import the data (modify the function to use actual service calls):
   importDataToSupabase(yourExportedData)

5. After confirming data is migrated correctly:
   clearLocalStorageData()

Available functions:
- exportLocalStorageData()
- importDataToSupabase(data)
- clearLocalStorageData()
`);
