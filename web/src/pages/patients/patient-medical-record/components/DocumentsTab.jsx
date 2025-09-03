import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const DocumentsTab = ({ documents }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const categories = [
    { value: "all", label: "All Documents" },
    { value: "lab-reports", label: "Lab Reports" },
    { value: "imaging", label: "Imaging" },
    { value: "discharge-summaries", label: "Discharge Summaries" },
    { value: "consent-forms", label: "Consent Forms" },
    { value: "insurance", label: "Insurance Documents" },
    { value: "referrals", label: "Referrals" },
  ];

  const filteredDocuments =
    documents?.filter((d) =>
      selectedCategory === "all" ? true : d?.category === selectedCategory
    ) || [];

  const iconFor = (type) =>
    ({ pdf: "FileText", image: "Image", dicom: "Scan", video: "Video" }[type] ||
    "File");

  const colorFor = (category) =>
    ({
      "lab-reports": "text-primary bg-primary/10",
      imaging: "text-accent bg-accent/10",
      "discharge-summaries": "text-success bg-success/10",
      "consent-forms": "text-warning bg-warning/10",
      insurance: "text-secondary bg-secondary/10",
      referrals: "text-text-primary bg-muted",
    }[category] || "text-text-secondary bg-muted");

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Select
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-48"
          />
          <div className="flex items-center space-x-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-3">
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-3">
              <Icon name="List" size={16} />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="Search" size={16} className="mr-2" />
            Search Documents
          </Button>
          <Button size="sm">
            <Icon name="Upload" size={16} className="mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-text-primary">
                  {selectedDocument?.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {selectedDocument?.uploadedBy} •{" "}
                  {selectedDocument?.uploadDate}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Icon name="Download" size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="Printer" size={16} className="mr-2" />
                  Print
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}>
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>
            <div className="p-4 h-96 bg-muted flex items-center justify-center">
              <div className="text-center">
                <Icon
                  name={iconFor(selectedDocument?.type)}
                  size={48}
                  className="mx-auto text-text-secondary mb-4"
                />
                <p className="text-text-secondary">
                  Document preview would appear here
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  {selectedDocument?.type?.toUpperCase()} •{" "}
                  {formatFileSize(selectedDocument?.size)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc?.id}
              className="bg-card border border-border rounded-lg p-4 healthcare-shadow hover:shadow-lg healthcare-transition cursor-pointer"
              onClick={() => setSelectedDocument(doc)}>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorFor(
                    doc?.category
                  )}`}>
                  <Icon name={iconFor(doc?.type)} size={24} />
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}>
                    <Icon name="Download" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}>
                    <Icon name="MoreVertical" size={14} />
                  </Button>
                </div>
              </div>
              <h3 className="font-medium text-text-primary mb-1 truncate">
                {doc?.name}
              </h3>
              <p className="text-xs text-text-secondary mb-2 capitalize">
                {doc?.category?.replace("-", " ")}
              </p>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{formatFileSize(doc?.size)}</span>
                <span>{doc?.uploadDate}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-text-secondary">
                  By {doc?.uploadedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">
                    Document
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">
                    Size
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">
                    Uploaded
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc?.id}
                    className="border-b border-border hover:bg-muted/50 healthcare-transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center ${colorFor(
                            doc?.category
                          )}`}>
                          <Icon name={iconFor(doc?.type)} size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {doc?.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {doc?.type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-sm text-text-primary">
                        {doc?.category?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {formatFileSize(doc?.size)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-text-primary">
                          {doc?.uploadDate}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {doc?.uploadedBy}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}>
                          <Icon name="Eye" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Download" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Share" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="FileText"
            size={48}
            className="mx-auto text-text-secondary mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Documents Found
          </h3>
          <p className="text-text-secondary">
            No documents match the selected category.
          </p>
          <Button className="mt-4">
            <Icon name="Upload" size={16} className="mr-2" />
            Upload First Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
