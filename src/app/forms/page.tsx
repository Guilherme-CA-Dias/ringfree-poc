"use client";

import { useState, useEffect } from "react";
import { Database, GitBranch, Loader2 } from "lucide-react";
import { useIntegrationApp } from "@integration-app/react";
import { useAuth, getAuthHeaders } from "@/app/auth-provider";

export default function SettingsPage() {
	const integrationApp = useIntegrationApp();
	const { customerId } = useAuth();
	const [configuring, setConfiguring] = useState<
		"dataSource" | "fieldMapping" | null
	>(null);
	const [flowRuns, setFlowRuns] = useState<any[]>([]);
	const [loadingFlowRuns, setLoadingFlowRuns] = useState(false);

	// Fetch flow runs
  useEffect(() => {
		const fetchFlowRuns = async () => {
			if (!customerId) return;

      try {
				setLoadingFlowRuns(true);
				const response = await fetch("/api/flow-runs", {
					headers: getAuthHeaders(),
				});

				if (response.ok) {
					const data = await response.json();
					setFlowRuns(data.items || data.flowRuns || []);
        }
      } catch (error) {
				console.error("Error fetching flow runs:", error);
      } finally {
				setLoadingFlowRuns(false);
			}
		};

		fetchFlowRuns();
	}, [customerId]);

  const handleConfigureDataSource = async () => {
		try {
			setConfiguring("dataSource");

			// Always use "meetings" as the data source name
			const dataSourceName = "meetings";
      
      // Get the first available connection
			const connectionsResponse = await integrationApp.connections.find();
			const firstConnection = connectionsResponse.items?.[0];
      
      if (!firstConnection) {
				alert("No connections found. Please set up a connection first.");
				return;
      }

			// Open the data source configuration for meetings
      await integrationApp
				.connection(firstConnection.id)
				.dataSource(dataSourceName)
				.openConfiguration();
    } catch (error) {
			console.error("Error configuring data source:", error);
    } finally {
			setConfiguring(null);
    }
	};

  const handleConfigureFieldMapping = async () => {
		try {
			setConfiguring("fieldMapping");

			// Always use "meetings" as the data source name
			const dataSourceName = "meetings";
      
      // Get the first available connection
			const connectionsResponse = await integrationApp.connections.find();
			const firstConnection = connectionsResponse.items?.[0];
      
      if (!firstConnection) {
				alert("No connections found. Please set up a connection first.");
				return;
      }

      await integrationApp
				.connection(firstConnection.id)
				.fieldMapping(dataSourceName)
				.setup();

      await integrationApp
				.connection(firstConnection.id)
				.fieldMapping(dataSourceName)
				.openConfiguration();
		} catch (error) {
			console.error("Error configuring field mapping:", error);
    } finally {
			setConfiguring(null);
    }
	};

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
					Configure data source and field mappings for meetings
        </p>
      </div>

			<div className="flex gap-2">
				<button
            onClick={handleConfigureDataSource}
					disabled={configuring === "dataSource"}
					className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
					{configuring === "dataSource" ? (
						<>
              <Loader2 className="h-4 w-4 animate-spin" />
							Configuring...
						</>
            ) : (
						<>
              <Database className="h-4 w-4" />
							Configure Data Source
						</>
            )}
				</button>
				<button
            onClick={handleConfigureFieldMapping}
					disabled={configuring === "fieldMapping"}
					className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
					{configuring === "fieldMapping" ? (
						<>
              <Loader2 className="h-4 w-4 animate-spin" />
							Configuring...
						</>
            ) : (
						<>
              <GitBranch className="h-4 w-4" />
							Configure Field Mapping
						</>
					)}
				</button>
			</div>

			{/* Flow Executions Table */}
			<div className="mt-8">
				<h2 className="text-2xl font-bold tracking-tight mb-4">
					Flow Executions
				</h2>
				{loadingFlowRuns ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-6 h-6 animate-spin text-gray-500" />
						<span className="ml-2 text-gray-500">Loading flow runs...</span>
					</div>
				) : flowRuns.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							No flow executions found.
						</p>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Flow ID
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Started At
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Completed At
										</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{flowRuns.map((run: any) => (
										<tr
											key={run.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
												{run.flowId || run.id || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
														run.status === "completed" ||
														run.status === "success"
															? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
															: run.status === "failed" ||
															  run.status === "error"
															? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
															: run.status === "running"
															? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
															: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
													}`}
												>
													{run.status || "unknown"}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{run.startedAt
													? new Date(run.startedAt).toLocaleString()
													: "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{run.completedAt
													? new Date(run.completedAt).toLocaleString()
													: "N/A"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
        </div>
      )}
			</div>
    </div>
	);
} 
