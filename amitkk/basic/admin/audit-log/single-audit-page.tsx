"use client"
import React from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AuditLogProps } from "@amitkk/basic/types";
import ModuleLink from "@amitkk/basic/static/ModuleLink";
import UserRow from "@amitkk/basic/static/UserRow";
import { UserRowProps } from "@amitkk/basic/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@amitkk/components/ui/card";

interface DataFormProps {
    dataId?: string;
} 

export const SingleAuditPage: React.FC<DataFormProps> = ({ dataId = '' }) => {
    const [data, setData] = React.useState<AuditLogProps | null>(null);
    React.useEffect(() => {
        const init_data = async () => {
            try {
                const res = await apiRequest("GET", `basic/routing?function=get_single_audit_log&id=${dataId}`);
                setData(res?.data)

          } catch (error) { clo( error ); }
        };
        init_data(); 
    }, [dataId]);
    
      return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Audit Log Details</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Module
              </p>

              <p>{data?.module || "—"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Module ID
              </p>

              <ModuleLink
                module={data?.module}
                module_url={(data?.module_id as any)?.url}
                module_name={(data?.module_id as any)?.name}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                User
              </p>

              <UserRow
                row={data?.user_id as unknown as UserRowProps}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>

              <p>
                {data?.createdAt
                  ? new Date(data.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Changes</h2>

        {data?.changes && data.changes.length > 0 ? (
          <div className="space-y-4">
            {data.changes.map((change, index) => (
              <Card key={index} className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{change.field_name}</CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Old Value
                      </p>

                      <pre className="rounded-md bg-background p-3 text-sm overflow-auto">
                        {JSON.stringify(change.old_value, null, 2) || "—"}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        New Value
                      </p>

                      <pre className="rounded-md bg-background p-3 text-sm overflow-auto">
                        {JSON.stringify(change.new_value, null, 2) || "—"}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No field-level changes recorded.
          </p>
        )}
      </div>
    </div>
  );
}

export default SingleAuditPage;