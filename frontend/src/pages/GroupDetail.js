import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users, DollarSign, MessageCircle, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/groups/${groupId}`),
        axios.get(`${API_URL}/groups/${groupId}/members`)
      ]);
      
      setGroup(groupRes.data);
      setMembers(membersRes.data);
      setIsMember(groupRes.data.members.includes(user.id));
      setIsAdmin(groupRes.data.admin_id === user.id);

      if (groupRes.data.admin_id === user.id) {
        const requestsRes = await axios.get(`${API_URL}/groups/${groupId}/join-requests`, getAuthHeader());
        setRequests(requestsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    try {
      await axios.post(`${API_URL}/groups/${groupId}/join-request`, {}, getAuthHeader());
      toast.success('Join request sent!');
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send request');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.post(`${API_URL}/groups/${groupId}/join-requests/${requestId}/approve`, {}, getAuthHeader());
      toast.success('Request approved!');
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API_URL}/groups/${groupId}/join-requests/${requestId}/reject`, {}, getAuthHeader());
      toast.success('Request rejected');
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">Group not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="p-8 border-2 border-border rounded-xl" data-testid="group-detail-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                {group.from_location} → {group.to_location}
              </h1>
              <Badge className="bg-accent/20 text-accent-foreground" data-testid="group-trip-type">
                {group.trip_type}
              </Badge>
            </div>
            {isMember && (
              <Button
                onClick={() => navigate(`/chat/${groupId}`)}
                data-testid="group-chat-btn"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-bold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Group Chat
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-mono">{new Date(group.travel_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span>{group.members.length}/{group.max_members} members</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-mono">${group.budget_min} - ${group.budget_max}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-heading font-bold text-xl mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{group.description}</p>
          </div>

          {!isMember && group.members.length < group.max_members && (
            <Button
              onClick={handleJoinRequest}
              data-testid="join-request-btn"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-6 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
            >
              Request to Join
            </Button>
          )}

          <div className="mt-8">
            <h3 className="font-heading font-bold text-xl mb-4">Members ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <Card key={member.id} className="p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold" data-testid={`member-name-${member.id}`}>{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.city}, {member.age} years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold">{member.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    {member.id === group.admin_id && (
                      <Badge className="bg-primary/20 text-primary">Admin</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {isAdmin && requests.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading font-bold text-xl mb-4">Pending Requests ({requests.length})</h3>
              <div className="space-y-3">
                {requests.map(({ request, user: reqUser }) => (
                  <Card key={request.id} className="p-4 border border-border flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{reqUser.name}</p>
                      <p className="text-sm text-muted-foreground">{reqUser.city}, {reqUser.age} years</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        data-testid={`approve-request-${request.id}`}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="outline"
                        data-testid={`reject-request-${request.id}`}
                        className="border-2 rounded-full"
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}