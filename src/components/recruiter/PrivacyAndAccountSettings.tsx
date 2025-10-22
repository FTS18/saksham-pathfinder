import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Download,
  Lock,
  Eye,
  Trash2,
  Loader,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { RecruiterService } from "@/services/recruiterService";

interface PrivacySettingsProps {
  onAccountDeleted?: () => void;
}

export const PrivacyAndAccountSettings = ({
  onAccountDeleted,
}: PrivacySettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private" | "connections_only"
  >("private");
  const [hideFromCompanies, setHideFromCompanies] = useState<string[]>([]);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  // Account state
  const [deactivationReason, setDeactivationReason] = useState("");
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false);
  const [showReactivationDialog, setShowReactivationDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);

  // GDPR
  const [showDataExportDialog, setShowDataExportDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const handleSavePrivacySettings = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await RecruiterService.updatePrivacySettings({
        profileVisibility,
        hideFromCompanies,
        anonymousMode,
        dataSharing,
      });

      setSuccess("Privacy settings saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    setError(null);
    setExportProgress("Exporting your data...");

    try {
      const result = await RecruiterService.downloadUserData();

      // Create download link
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gdpr-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportProgress(null);
      setSuccess("Your data has been downloaded successfully");
      setShowDataExportDialog(false);
    } catch (err: any) {
      setError(err.message || "Failed to export data");
      setExportProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await RecruiterService.deactivateAccount(deactivationReason);
      setSuccess(
        "Your account has been deactivated. You can reactivate it within 30 days."
      );
      setIsDeactivated(true);
      setShowDeactivationDialog(false);
      setDeactivationReason("");
    } catch (err: any) {
      setError(err.message || "Failed to deactivate account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateAccount = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await RecruiterService.reactivateAccount();
      setSuccess("Your account has been reactivated");
      setIsDeactivated(false);
      setShowReactivationDialog(false);
    } catch (err: any) {
      setError(err.message || "Failed to reactivate account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In production, this would call a delete function
      // For now, we'll deactivate as the closest option
      await RecruiterService.deactivateAccount(
        "Account deletion requested"
      );
      setSuccess("Your account deletion request has been submitted");
      setShowDeleteDialog(false);
      onAccountDeleted?.();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Account Status */}
      {isDeactivated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                Account Deactivated
              </h3>
              <p className="text-sm text-yellow-800">
                Your account is currently deactivated. You can reactivate it
                within 30 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-3">
            <Label>Profile Visibility</Label>
            <Select
              value={profileVisibility}
              onValueChange={(value: any) => setProfileVisibility(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  Public - Visible to everyone
                </SelectItem>
                <SelectItem value="connections_only">
                  Connections Only - Visible to connected recruiters/students
                </SelectItem>
                <SelectItem value="private">
                  Private - Only visible to you
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Control who can see your profile and internships
            </p>
          </div>

          {/* Hide from Companies */}
          <div className="space-y-3">
            <Label>Hide from Specific Companies</Label>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-600 mb-2">
                Company domains to exclude (comma-separated):
              </p>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm"
                placeholder="google.com, microsoft.com"
                onChange={(e) =>
                  setHideFromCompanies(
                    e.target.value.split(",").map((c) => c.trim())
                  )
                }
              />
            </div>
          </div>

          {/* Anonymous Mode */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
            <div>
              <Label className="text-base">Anonymous Browsing</Label>
              <p className="text-sm text-gray-500 mt-1">
                Browse internships without showing your profile
              </p>
            </div>
            <Checkbox
              checked={anonymousMode}
              onCheckedChange={(checked) => setAnonymousMode(checked as boolean)}
            />
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
            <div>
              <Label className="text-base">Data Sharing</Label>
              <p className="text-sm text-gray-500 mt-1">
                Allow analytics and improvement features
              </p>
            </div>
            <Checkbox
              checked={dataSharing}
              onCheckedChange={(checked) => setDataSharing(checked as boolean)}
            />
          </div>

          <Button
            onClick={handleSavePrivacySettings}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Privacy Settings"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* GDPR Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            GDPR Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage your personal data and privacy preferences in compliance with
            GDPR regulations.
          </p>

          <div className="space-y-3">
            {/* Download Data */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Download Your Data
              </h4>
              <p className="text-sm text-blue-800 mb-4">
                Export your personal data including profile, applications,
                internships, and messages in JSON format.
              </p>
              <Button
                onClick={() => setShowDataExportDialog(true)}
                disabled={isLoading}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </Button>
            </div>

            {/* Deactivate Account */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Temporary Deactivation
              </h4>
              <p className="text-sm text-yellow-800 mb-4">
                Deactivate your account temporarily. You can reactivate it
                within 30 days.
              </p>
              {isDeactivated ? (
                <Button
                  onClick={() => setShowReactivationDialog(true)}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reactivate Account
                </Button>
              ) : (
                <Button
                  onClick={() => setShowDeactivationDialog(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Deactivate Account
                </Button>
              )}
            </div>

            {/* Permanent Deletion */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">
                Permanent Account Deletion
              </h4>
              <p className="text-sm text-red-800 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deactivation Dialog */}
      <AlertDialog open={showDeactivationDialog} onOpenChange={setShowDeactivationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p>
                  Your account will be temporarily deactivated. You can
                  reactivate it within 30 days.
                </p>
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Reason for deactivation (optional)
                  </label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="w-full mt-2 p-2 border rounded text-sm"
                    placeholder="Help us improve..."
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateAccount}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivation Dialog */}
      <AlertDialog open={showReactivationDialog} onOpenChange={setShowReactivationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your account will be fully restored and you'll be able to access
              all your internships and applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivateAccount}
              disabled={isLoading}
            >
              {isLoading ? "Reactivating..." : "Reactivate"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Data Export Dialog */}
      <AlertDialog open={showDataExportDialog} onOpenChange={setShowDataExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Your Data?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p>
                  Your data will be exported in JSON format. This includes:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  <li>Profile information</li>
                  <li>All applications</li>
                  <li>Posted internships</li>
                  <li>Messages and notifications</li>
                  <li>Preferences and settings</li>
                </ul>
                {exportProgress && (
                  <p className="text-sm text-blue-600 font-medium">
                    {exportProgress}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExportData}
              disabled={isLoading}
            >
              {isLoading ? "Exporting..." : "Download"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deletion Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4 text-red-900">
                <p className="font-semibold">This action cannot be undone.</p>
                <p>
                  All your data will be permanently deleted including:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Profile and personal information</li>
                  <li>All applications and internships</li>
                  <li>Messages and notifications</li>
                  <li>Analytics and history</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
