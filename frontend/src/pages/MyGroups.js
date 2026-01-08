import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyGroups() {
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/my-groups`, getAuthHeader());
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to fetch your groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-heading font-bold mb-2">My Groups</h1>
        <p className="text-muted-foreground mb-8">Groups you've joined</p>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-xl text-muted-foreground">You haven't joined any groups yet</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="my-groups-list">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="overflow-hidden border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer hover:shadow-lg"
                onClick={() => navigate(`/group/${group.id}`)}
                data-testid={`my-group-card-${group.id}`}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.to_location}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://source.unsplash.com/800x600/?travel,nature";
                    }}
                  />
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-heading font-bold text-xl">
                    {group.from_location} → {group.to_location}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-mono">{new Date(group.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{group.members.length}/{group.max_members} members</span>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-accent/20 text-accent-foreground">
                      {group.trip_type}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}