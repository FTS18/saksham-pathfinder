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
import InternshipMigrationService from "@/services/internshipMigrationService";
import { Internship } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedInternshipFormProps {
  internship?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

// Format number to Indian rupee format (e.g., 120000 -> 1,20,000)
const formatIndianRupee = (value: string | number) => {
  const numStr = String(value).replace(/,/g, "");
  const num = parseInt(numStr) || 0;
  return new Intl.NumberFormat("en-IN").format(num);
};

// Parse Indian rupee format back to number
const parseIndianRupee = (value: string) => {
  return value.replace(/,/g, "");
};

export const EnhancedInternshipForm = ({
  internship,
  onSave,
  onCancel,
}: EnhancedInternshipFormProps) => {
  const { currentUser } = useAuth();
  const [companyName, setCompanyName] = useState("Saksham AI");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [stipend, setStipend] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [sector, setSector] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [maxApplications, setMaxApplications] = useState("100");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (internship) {
      setTitle(internship.title || "");
      setDescription(internship.description || "");
      setLocation(
        typeof internship.location === "string"
          ? internship.location
          : internship.location?.city || ""
      );
      setStipend(internship.stipend ? formatIndianRupee(internship.stipend) : "");
      setDurationMonths(internship.duration?.replace(" months", "").replace(" month", "") || "");
      setSector(internship.sector || "");
      setSkills(internship.skills || []);
      setWorkMode(internship.workMode || "Hybrid");
      setApplicationDeadline(internship.applicationDeadline || "");
      setMaxApplications(String(internship.maxApplications || 100));
      setCompanyLogoUrl(internship.companyLogoUrl || "");
    }
  }, [internship]);

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentUser?.uid) {
        throw new Error("Please sign in first before creating an internship");
      }

      if (!title || !description || !sector || !durationMonths || !stipend) {
        throw new Error("Please fill in all required fields");
      }

      const internshipData: any = {
        recruiterId: currentUser.uid,
        title,
        description,
        location,
        stipend: parseIndianRupee(stipend),
        duration: `${durationMonths} month${durationMonths !== "1" ? "s" : ""}`,
        sector,
        skills,
        workMode,
        applicationDeadline,
        maxApplications: parseInt(maxApplications),
        companyName: "Saksham AI",
        companyLogoUrl,
        status: publish ? "published" : "draft",
      };

      if (internship?.id) {
        await InternshipMigrationService.updateInternship(internship.id, internshipData);
        setSuccess(`Internship ${publish ? "published" : "updated"} successfully`);
      } else {
        await InternshipMigrationService.createInternship(internshipData);
        setSuccess(`Internship ${publish ? "published" : "saved as draft"} successfully`);
        // Reset form
        setTitle("");
        setDescription("");
        setLocation("");
        setStipend("");
        setDurationMonths("");
        setSector("");
        setSkills([]);
        setApplicationDeadline("");
      }

      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to save internship");
      console.error("Error saving internship:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!internship?.id) return;
    if (!window.confirm("Are you sure you want to delete this internship?")) return;

    setIsLoading(true);
    try {
      await InternshipMigrationService.deleteInternship(internship.id);
      setSuccess("Internship deleted successfully");
      onCancel?.();
    } catch (err: any) {
      setError(err.message || "Failed to delete internship");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
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

  return (
    <form className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
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

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">
          {internship?.id ? "Edit Internship" : "Post New Internship"}
        </h2>
        {internship?.id && (
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Company Name (Read-only) */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={companyName}
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Company name is locked to Saksham AI</p>
        </div>
      </div>

      {/* Job Title & Sector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Web Developer"
            required
          />
        </div>
        <div>
          <Label htmlFor="sector">Sector *</Label>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger id="sector">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role, responsibilities, and requirements..."
          rows={5}
          required
        />
      </div>

      {/* Location & Work Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Delhi, Remote"
          />
        </div>
        <div>
          <Label htmlFor="workMode">Work Mode</Label>
          <Select value={workMode} onValueChange={setWorkMode}>
            <SelectTrigger id="workMode">
              <SelectValue />
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
      </div>

      {/* Stipend & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stipend">Stipend (Monthly) *</Label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-muted-foreground">₹</span>
            <Input
              id="stipend"
              value={stipend}
              onChange={(e) => {
                const parsed = parseIndianRupee(e.target.value);
                if (!isNaN(parseInt(parsed))) {
                  setStipend(formatIndianRupee(parsed));
                }
              }}
              placeholder="e.g., 50,000"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Format: 50,000 or 1,20,000</p>
        </div>
        <div>
          <Label htmlFor="duration">Duration (Months) *</Label>
          <Input
            id="duration"
            type="number"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            placeholder="e.g., 6"
            min="1"
            max="24"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Number of months only</p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label htmlFor="skills">Required Skills</Label>
        <div className="flex gap-2 mb-3">
          <Input
            id="skills"
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
          <Button
            type="button"
            onClick={addSkill}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-2 text-xs hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Application Deadline & Max Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline">Application Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="maxApps">Max Applications</Label>
          <Input
            id="maxApps"
            type="number"
            value={maxApplications}
            onChange={(e) => setMaxApplications(e.target.value)}
            min="1"
            placeholder="100"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isLoading}
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : internship?.id ? "Update" : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isLoading ? "Publishing..." : internship?.id ? "Update & Publish" : "Post Now"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="ghost"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
