import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Eye, Copy, Trash2, Loader } from "lucide-react";
import { RecruiterService } from "@/services/recruiterService";
import { Internship } from "@/types";
import { CustomToast } from "@/components/CustomToast";

interface InternshipFormProps {
  internship?: Internship | null;
  onSave?: () => void;
  onCancel?: () => void;
  onPublish?: (internshipId: string) => void;
}

export const InternshipForm = ({
  internship,
  onSave,
  onCancel,
  onPublish,
}: InternshipFormProps) => {
  const [formData, setFormData] = useState<Partial<Internship>>({
    title: "",
    description: "",
    location: "",
    stipend: "",
    duration: "",
    sector: "",
    skills: [],
    workMode: "Hybrid",
    applicationDeadline: "",
    companyLogoUrl: "",
    maxApplications: 100,
  });

  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-save functionality
  const autoSaveDraft = useCallback(
    async (data: Partial<Internship>) => {
      if (!internship?.id) return;

      try {
        await RecruiterService.saveDraft(internship.id, data);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    },
    [internship?.id]
  );

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title || "",
        description: internship.description || "",
        location:
          typeof internship.location === "string"
            ? internship.location
            : internship.location?.city || "",
        stipend: internship.stipend || "",
        duration: internship.duration || "",
        sector: internship.sector || "",
        skills: internship.skills || [],
        workMode: internship.workMode || "Hybrid",
        applicationDeadline: internship.applicationDeadline || "",
        companyLogoUrl: internship.companyLogoUrl || "",
        maxApplications: internship.maxApplications || 100,
      });
      setIsDraft(internship.status === "draft");
    }
  }, [internship]);

  const handleInputChange = (
    field: keyof Partial<Internship>,
    value: any
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Auto-save after a short delay
    const timer = setTimeout(() => {
      autoSaveDraft(updated);
    }, 1500);

    return () => clearTimeout(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (internship?.id) {
        // Update existing internship
        await RecruiterService.updateInternship(internship.id, formData);
        setSuccess("Internship updated successfully");
      } else {
        // Create new internship
        const result = await RecruiterService.createInternship(formData);
        setSuccess("Internship created successfully");
        // Set the ID for future updates
        if (result.internshipId) {
          setFormData((prev) => ({
            ...prev,
            id: result.internshipId,
          }));
        }
      }

      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to save internship");
      console.error("Error saving internship:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!internship?.id) {
      setError("Cannot publish unsaved internship");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await RecruiterService.publishInternship(internship.id);
      setSuccess("Internship published successfully");
      setIsDraft(false);
      onPublish?.(internship.id);
    } catch (err: any) {
      setError(err.message || "Failed to publish internship");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!internship?.id) {
      setError("Cannot duplicate unsaved internship");
      return;
    }

    setIsLoading(true);
    try {
      // Create a new internship with the same data
      const duplicateData = {
        ...formData,
        title: `${formData.title} (Copy)`,
      };
      const result = await RecruiterService.createInternship(duplicateData);
      setSuccess("Internship duplicated successfully");
      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to duplicate internship");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!internship?.id) {
      setError("Cannot delete unsaved internship");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this internship?")) {
      return;
    }

    setIsLoading(true);
    try {
      await RecruiterService.deleteInternship(internship.id);
      setSuccess("Internship deleted successfully");
      onCancel?.();
    } catch (err: any) {
      setError(err.message || "Failed to delete internship");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && formData.skills) {
      const updated = {
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      };
      setFormData(updated);
      autoSaveDraft(updated);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const updated = {
      ...formData,
      skills: formData.skills?.filter((_, i) => i !== index) || [],
    };
    setFormData(updated);
    autoSaveDraft(updated);
  };

  const SECTORS = [
    "Technology",
    "Finance",
    "Healthcare",
    "Manufacturing",
    "Retail",
    "Education",
    "Energy",
    "Transportation",
    "Entertainment",
    "Other",
  ];

  const WORK_MODES = ["Remote", "On-site", "Hybrid"];

  const DURATIONS = [
    "1 month",
    "2 months",
    "3 months",
    "4 months",
    "5 months",
    "6 months",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {internship?.id ? "Edit Internship" : "Create New Internship"}
        </h2>
        <div className="flex gap-2">
          {internship?.id && (
            <>
              {isDraft && (
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
              <Button
                type="button"
                onClick={handleDuplicate}
                disabled={isLoading}
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

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

      {/* Status Badge */}
      {internship?.id && (
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Status:</span>
          <Badge
            variant={isDraft ? "secondary" : "default"}
            className="capitalize"
          >
            {isDraft ? "Draft" : "Published"}
          </Badge>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Frontend Developer Intern"
              required
            />
          </div>

          <div>
            <Label htmlFor="sector">Sector *</Label>
            <Select
              value={formData.sector}
              onValueChange={(value) => handleInputChange("sector", value)}
            >
              <SelectTrigger id="sector">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={
                typeof formData.location === "string"
                  ? formData.location
                  : formData.location?.city || ""
              }
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Bangalore, India"
              required
            />
          </div>

          <div>
            <Label htmlFor="workMode">Work Mode *</Label>
            <Select
              value={formData.workMode}
              onValueChange={(value) => handleInputChange("workMode", value)}
            >
              <SelectTrigger id="workMode">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stipend">Stipend</Label>
            <Input
              id="stipend"
              value={formData.stipend}
              onChange={(e) => handleInputChange("stipend", e.target.value)}
              placeholder="e.g., ₹20,000 - ₹30,000 per month"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration *</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => handleInputChange("duration", value)}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold">Description</h3>

        <div>
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the internship, responsibilities, and what students will learn..."
            rows={8}
            required
          />
        </div>
      </div>

      {/* Skills Required */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold">Required Skills</h3>

        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill and press Enter"
          />
          <Button type="button" onClick={addSkill} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.skills?.map((skill, index) => (
            <Badge key={index} variant="secondary" className="cursor-pointer">
              {skill}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => removeSkill(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold">Additional Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="applicationDeadline">Application Deadline</Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                handleInputChange("applicationDeadline", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="maxApplications">Max Applications</Label>
            <Input
              id="maxApplications"
              type="number"
              value={formData.maxApplications}
              onChange={(e) =>
                handleInputChange("maxApplications", parseInt(e.target.value))
              }
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
            <Input
              id="companyLogoUrl"
              value={formData.companyLogoUrl}
              onChange={(e) =>
                handleInputChange("companyLogoUrl", e.target.value)
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end sticky bottom-0 bg-white p-6 rounded-lg border">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
