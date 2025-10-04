import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Database, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react';
import InternshipMigrationService from '@/services/internshipMigrationService';
import { useAuth } from '@/contexts/AuthContext';

export const InternshipMigration = () => {
  const { currentUser } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    migrated: number;
    errors: number;
  }>({ total: 0, migrated: 0, errors: 0 });

  const loadLocalData = async () => {
    try {
      const response = await fetch('/internships.json');
      if (!response.ok) {
        throw new Error('Failed to load local internships data');
      }
      return await response.json();
    } catch (error) {
      throw new Error('Could not load internships.json file');
    }
  };

  const runMigration = async () => {
    setMigrationStatus('loading');
    setMessage('Loading internships data...');
    
    try {
      const internshipsData = await loadLocalData();
      setStats({ total: internshipsData.length, migrated: 0, errors: 0 });
      setMessage(`Found ${internshipsData.length} internships to migrate`);

      setMessage('Starting migration to Firebase...');
      await InternshipMigrationService.migrateFromJSON(internshipsData);
      
      setStats(prev => ({ ...prev, migrated: prev.total }));
      setMessage(`✅ Successfully migrated ${internshipsData.length} internships!`);
      setMigrationStatus('success');
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMessage(`❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMigrationStatus('error');
    }
  };

  const clearFirebaseData = async () => {
    if (!confirm('Are you sure you want to clear all internships from Firebase? This action cannot be undone.')) {
      return;
    }

    setMigrationStatus('loading');
    setMessage('Clearing Firebase data...');
    
    try {
      await InternshipMigrationService.clearAllInternships();
      setMessage('✅ Firebase data cleared successfully');
      setMigrationStatus('success');
      setStats({ total: 0, migrated: 0, errors: 0 });
    } catch (error) {
      console.error('Clear failed:', error);
      setMessage(`❌ Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMigrationStatus('error');
    }
  };

  const testFirebaseConnection = async () => {
    setMigrationStatus('loading');
    setMessage('Testing Firebase connection...');
    
    try {
      const internships = await InternshipMigrationService.getAllInternships();
      setMessage(`✅ Firebase connected! Found ${internships.length} internships in database`);
      setMigrationStatus('success');
      setStats(prev => ({ ...prev, total: internships.length }));
    } catch (error) {
      console.error('Firebase test failed:', error);
      setMessage(`❌ Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMigrationStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Internship Data Migration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              This tool migrates internship data from the local JSON file to Firebase Firestore.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Records</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.migrated}</div>
              <div className="text-sm text-green-600">Migrated</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
          </div>

          {message && (
            <Alert className={
              migrationStatus === 'success' ? 'border-green-200 bg-green-50' :
              migrationStatus === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              {migrationStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {migrationStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              {migrationStatus === 'loading' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testFirebaseConnection}
              disabled={migrationStatus === 'loading'}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Test Firebase
            </Button>
            
            <Button 
              onClick={runMigration}
              disabled={migrationStatus === 'loading'}
            >
              <Upload className="w-4 h-4 mr-2" />
              Start Migration
            </Button>
            
            <Button 
              onClick={clearFirebaseData}
              disabled={migrationStatus === 'loading'}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};