import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, FlatList } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X, Info, Ghost } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { rankJobsForCandidate, rankCandidatesForJob } from '../utils/recommendationEngine';
import { MOCK_JOBS, MOCK_CANDIDATES } from '../data/mockData';

const { height, width } = Dimensions.get('window');
// approximate tabbar adjust
const ITEM_HEIGHT = height - 80;

export default function FeedScreen() {
  const { role, activeProfile, addLike, usersDB } = useAppContext();
  const [deck, setDeck] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (role === 'SEEKER') {
      const customJobs = Object.values(usersDB || {}).filter(u => u.role === 'RECRUITER');
      const allJobs = [...MOCK_JOBS, ...customJobs];
      const sortedJobs = rankJobsForCandidate(activeProfile, allJobs);
      setDeck(sortedJobs);
    } else {
      const customSeekers = Object.values(usersDB || {}).filter(u => u.role === 'SEEKER' && u.id !== activeProfile.id);
      const allCandidates = [...MOCK_CANDIDATES, ...customSeekers];
      const sortedCandidates = rankCandidatesForJob(activeProfile, allCandidates);
      setDeck(sortedCandidates);
    }
  }, [role, activeProfile, usersDB]);

  const handleAction = (item, index, type) => {
    if (type === 'like') {
      addLike(
        role === 'SEEKER' ? activeProfile.id : item.id,
        role === 'SEEKER' ? item.id : activeProfile.id,
        role
      );
    }
    // Snap to the next item
    if (index < deck.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const renderItem = ({ item, index }) => {
    const isGhosted = item.isGhost && item.role === 'SEEKER';
    
    // Quick Match Score Calculation
    const mySkills = activeProfile.skills || activeProfile.skillsReq || [];
    const theirSkills = item.skills || item.skillsReq || [];
    const intersection = mySkills.filter(s => theirSkills.includes(s)).length;
    const computedScore = Math.min(100, Math.max(50, Math.floor((intersection / 3) * 50 + 50)));

    return (
      <View style={styles.cardContainer}>
        {item.videoUri ? (
          <Video
            source={{ uri: item.videoUri }}
            style={styles.fullscreenImage}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
          />
        ) : isGhosted ? (
          <View style={[styles.fullscreenImage, styles.ghostBg]}>
             <Ghost size={120} color="#334155" />
          </View>
        ) : (
          <Image source={{ uri: item.image }} style={styles.fullscreenImage} />
        )}
        
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)', '#020617']} style={styles.gradient} />
        
        {/* Match Percentage Badge */}
        <View style={styles.matchBadge}>
           <Text style={styles.matchText}>{computedScore}% MATCH</Text>
        </View>

        {/* Left Side Content */}
        <View style={styles.contentOverlay}>
          <Text style={styles.title}>{isGhosted ? "Anonymous Applicant" : (item.name || item.title)}</Text>
          <Text style={styles.subtitle}>{isGhosted ? "Hidden History" : (item.company || item.title)}</Text>
          <Text style={styles.highlight}>{item.salary || item.experience}</Text>
          <Text style={styles.description} numberOfLines={3}>{isGhosted ? "This user is browsing privately. Swipe right to request identity." : (item.bio || item.description)}</Text>
          <View style={styles.skills}>
            {(theirSkills).slice(0, 3).map((skill, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Side Floating Buttons */}
        <View style={styles.actionColumn}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, index, 'like')}>
            <Heart size={32} color="#2563eb" fill="#2563eb" />
            <Text style={styles.actionLabel}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, index, 'skip')}>
            <X size={32} color="#f8fafc" />
            <Text style={styles.actionLabel}>Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Info size={32} color="#0ea5e9" />
            <Text style={styles.actionLabel}>Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (deck.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color:'white', fontSize: 20}}>No more profiles available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={deck}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardContainer: {
    height: ITEM_HEIGHT,
    width,
    position: 'relative',
  },
  fullscreenImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  ghostBg: {
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
  },
  matchBadge: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#38bdf8'
  },
  matchText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 80, 
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '600',
    marginBottom: 6,
  },
  highlight: {
    fontSize: 16,
    color: '#38bdf8',
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#f8fafc',
    lineHeight: 22,
    marginBottom: 12,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '700',
  },
  actionColumn: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  }
});
