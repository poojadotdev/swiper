import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { MOCK_CANDIDATES, MOCK_JOBS } from '../data/mockData';
import { Ghost, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.85;

const COLUMNS = [
  { id: 'MATCHED', title: 'Matches' },
  { id: 'INTERVIEWING', title: 'Interviewing' },
  { id: 'OFFER', title: 'Offers' }
];

export default function MatchesScreen() {
  const { role, activeProfile, getMatchesForRecruiter, getMatchesForSeeker, usersDB, kanbanStatuses, updateKanbanStatus } = useAppContext();

  const allCandidates = [...MOCK_CANDIDATES, ...Object.values(usersDB || {}).filter(u => u.role === 'SEEKER')];
  const allJobs = [...MOCK_JOBS, ...Object.values(usersDB || {}).filter(u => u.role === 'RECRUITER')];

  let rawMatches = [];
  if (role === 'RECRUITER') {
    rawMatches = getMatchesForRecruiter(activeProfile.id);
  } else {
    rawMatches = getMatchesForSeeker(activeProfile.id);
  }

  const advanceKanban = (matchKey, currentStatus) => {
    if (currentStatus === 'MATCHED') updateKanbanStatus(matchKey, 'INTERVIEWING');
    else if (currentStatus === 'INTERVIEWING') updateKanbanStatus(matchKey, 'OFFER');
  };

  const renderItem = ({ item }) => {
    const isRecruiter = role === 'RECRUITER';
    const profile = isRecruiter 
      ? allCandidates.find(c => c.id === item.candidateId) 
      : allJobs.find(j => j.id === item.jobId);
      
    if (!profile) return null;
    
    // Check ghost mode
    const isGhosted = profile.isGhost && profile.role === 'SEEKER';
    const matchKey = `${item.candidateId}-${item.jobId}`;
    const status = kanbanStatuses[matchKey] || 'MATCHED';

    return (
      <View style={styles.matchCard}>
        {isGhosted ? (
           <View style={[styles.avatar, styles.ghostBg]}>
             <Ghost size={24} color="#334155" />
           </View>
        ) : (
          <Image source={{ uri: profile.image }} style={styles.avatar} />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{isGhosted ? "Anonymous Applicant" : (isRecruiter ? profile.name : profile.company)}</Text>
          <Text style={styles.subtitle}>{isGhosted ? "Hidden History" : profile.title}</Text>
          <Text style={styles.location}>{isGhosted ? "Unknown Location" : profile.location}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          {status !== 'OFFER' && (
            <TouchableOpacity style={styles.advanceButton} onPress={() => advanceKanban(matchKey, status)}>
                <ChevronRight color="#000" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Pipeline</Text>
      
      {rawMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet.</Text>
          <Text style={styles.emptySub}>Keep swiping to find the perfect fit!</Text>
        </View>
      ) : (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {COLUMNS.map(col => {
            const laneMatches = rawMatches.filter(m => {
              const key = `${m.candidateId}-${m.jobId}`;
              const s = kanbanStatuses[key] || 'MATCHED';
              return s === col.id;
            });
            return (
              <View key={col.id} style={styles.lane}>
                <View style={styles.laneHeader}>
                  <Text style={styles.laneTitle}>{col.title}</Text>
                  <View style={styles.badge}><Text style={styles.badgeText}>{laneMatches.length}</Text></View>
                </View>
                <FlatList
                  data={laneMatches}
                  keyExtractor={item => `${item.candidateId}-${item.jobId}`}
                  renderItem={renderItem}
                  contentContainerStyle={styles.list}
                />
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    padding: 24,
    color: '#ffffff',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  lane: {
    width: COLUMN_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  laneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0ea5e9',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900'
  },
  list: {
    paddingHorizontal: 20,
  },
  matchCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#0f172a',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ghostBg: {
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 0,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  info: {
    marginBottom: 16
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  chatButton: {
      flex: 1,
      backgroundColor: '#2563eb',
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 0,
  },
  chatButtonText: {
      color: '#ffffff',
      fontWeight: '900',
      textTransform: 'uppercase'
  },
  advanceButton: {
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 16,
    color: '#0ea5e9',
    textAlign: 'center',
    fontWeight: '800'
  }
});
