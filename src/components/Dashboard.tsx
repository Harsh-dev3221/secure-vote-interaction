
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowUp, Info, RefreshCw } from "lucide-react";

// Mock election results data
const initialData = [
  { name: "Jane Smith", value: 35, color: "#4f46e5" },
  { name: "John Adams", value: 30, color: "#ef4444" },
  { name: "Sarah Johnson", value: 20, color: "#10b981" },
  { name: "Michael Chen", value: 10, color: "#f59e0b" },
  { name: "David Rodriguez", value: 5, color: "#8b5cf6" },
];

const Dashboard = () => {
  const [data, setData] = useState(initialData);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate total votes
  useEffect(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    setTotalVotes(total);
  }, [data]);

  // Simulate live updates
  const refreshData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Generate slightly different values for simulation
      const updatedData = data.map(item => ({
        ...item,
        value: Math.max(1, item.value + Math.floor(Math.random() * 5) - 2)
      }));
      
      setData(updatedData);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Votes: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium">{((data.value / totalVotes) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="min-h-screen py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="h2 mb-2">Election Results Dashboard</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time election results with transparent blockchain verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Vote Distribution</h3>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  Last updated: {formatDate(lastUpdated)}
                </span>
                <button 
                  onClick={refreshData} 
                  disabled={isLoading}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Stats and info */}
          <div className="space-y-6">
            {/* Total votes */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Total Votes Cast</h3>
                <div className="bg-primary/10 p-2 rounded-full">
                  <ArrowUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-4xl font-bold">{totalVotes.toLocaleString()}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">+2.5%</span> from previous hour
              </div>
            </div>
            
            {/* Candidates list */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
              <h3 className="text-lg font-medium mb-4">Leading Candidates</h3>
              <div className="space-y-4">
                {data
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((candidate, index) => (
                    <div key={candidate.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span>{candidate.name}</span>
                      </div>
                      <div className="font-medium">{((candidate.value / totalVotes) * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Blockchain info */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium mb-2">Blockchain Verification</h3>
                  <p className="text-xs text-muted-foreground">
                    All votes are recorded on a secure blockchain for maximum transparency. 
                    Each vote has a unique identifier that can be verified without compromising voter anonymity.
                  </p>
                  <a href="#" className="text-xs text-primary font-medium mt-2 inline-block hover:underline">
                    Learn more about our technology
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
