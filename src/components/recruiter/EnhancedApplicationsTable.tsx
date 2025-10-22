import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import {
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  FileJson,
  Loader,
} from "lucide-react";
import { RecruiterService } from "@/services/recruiterService";
import { Application } from "@/types";
import { CustomToast } from "@/components/CustomToast";

interface ApplicationsTableProps {
  internshipId?: string;
  limit?: number;
}

type SortField = "appliedAt" | "status";
type SortOrder = "asc" | "desc";

interface Filters {
  status?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  applied: "bg-blue-100 text-blue-800",
  "in-review": "bg-purple-100 text-purple-800",
  shortlisted: "bg-green-100 text-green-800",
  interview: "bg-indigo-100 text-indigo-800",
  interview_scheduled: "bg-indigo-100 text-indigo-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

const STATUSES = [
  "pending",
  "applied",
  "in-review",
  "shortlisted",
  "interview",
  "interview_scheduled",
  "accepted",
  "rejected",
  "withdrawn",
];

export const EnhancedApplicationsTable = ({
  internshipId,
  limit = 50,
}: ApplicationsTableProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "appliedAt",
    sortOrder: "desc",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await RecruiterService.getApplications({
        internshipId,
        status: filters.status,
        limit,
        offset,
      });

      setApplications(result.applications);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [internshipId, filters.status, offset]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await RecruiterService.updateApplicationStatus(
        applicationId,
        newStatus
      );
      setSuccess(`Application status updated to ${newStatus}`);
      fetchApplications();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedApplications.size === 0) {
      setError("Please select applications first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await RecruiterService.bulkUpdateApplicationStatus(
        Array.from(selectedApplications),
        newStatus
      );
      setSuccess(
        `${selectedApplications.size} applications updated to ${newStatus}`
      );
      setSelectedApplications(new Set());
      fetchApplications();
    } catch (err: any) {
      setError(err.message || "Failed to bulk update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(new Set(applications.map((app) => app.id || "")));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    const newSelected = new Set(selectedApplications);
    if (checked) {
      newSelected.add(applicationId);
    } else {
      newSelected.delete(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const handleExportCSV = async () => {
    try {
      const csv = await RecruiterService.exportApplicationsToCSV(internshipId);
      const url = window.URL.createObjectURL(csv);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess("Applications exported successfully");
    } catch (err) {
      setError("Failed to export applications");
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(applications, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess("Applications exported successfully");
    } catch (err) {
      setError("Failed to export applications");
    }
  };

  const sortApplications = (apps: Application[]): Application[] => {
    const sorted = [...apps];
    sorted.sort((a, b) => {
      let aVal: any = a[filters.sortBy];
      let bVal: any = b[filters.sortBy];

      if (filters.sortBy === "appliedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (filters.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return sorted;
  };

  const sortedApplications = sortApplications(applications);

  return (
    <div className="space-y-4">
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

      {/* Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 rounded-lg border">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium">Filter by Status:</span>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedApplications.size > 0 && (
            <>
              <div className="text-sm text-gray-600">
                {selectedApplications.size} selected
              </div>
              <Select onValueChange={handleBulkStatusChange} disabled={isLoading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Bulk action..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      Set to {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            disabled={isLoading || applications.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleExportJSON}
            disabled={isLoading || applications.length === 0}
            variant="outline"
            size="sm"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        {isLoading && applications.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No applications found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      applications.length > 0 &&
                      selectedApplications.size === applications.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        sortBy: "appliedAt",
                        sortOrder:
                          filters.sortOrder === "desc" ? "asc" : "desc",
                      })
                    }
                  >
                    Applied
                    {filters.sortBy === "appliedAt" &&
                      (filters.sortOrder === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      ))}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        sortBy: "status",
                        sortOrder:
                          filters.sortOrder === "desc" ? "asc" : "desc",
                      })
                    }
                  >
                    Status
                    {filters.sortBy === "status" &&
                      (filters.sortOrder === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      ))}
                  </button>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedApplications.has(application.id || "")}
                      onCheckedChange={(checked) =>
                        handleSelectApplication(
                          application.id || "",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {application.companyName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {/* Would need to fetch from user profile */}
                    {application.userId}
                  </TableCell>
                  <TableCell>{application.internshipTitle}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {application.appliedAt
                      ? new Date(application.appliedAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        STATUS_COLORS[application.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {application.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={application.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(application.id || "", newStatus)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {applications.length} applications
          {hasMore && " (more available)"}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setOffset(offset + limit)}
            disabled={!hasMore || isLoading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
