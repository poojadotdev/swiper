import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera, FileText, Video, EyeOff } from 'lucide-react-native';

export default function ProfileScreen() {
  const { activeProfile, updateProfile } = useAppContext();
  const [photoUri, setPhotoUri] = useState(activeProfile?.image || null);
  const [videoUri, setVideoUri] = useState(activeProfile?.videoUri || null);
  const [resumeName, setResumeName] = useState(activeProfile?.resumeName || null);
  
  const toggleGhostMode = () => {
    updateProfile({ isGhost: !activeProfile?.isGhost });
  };

  const pickMedia = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ['videos'] : ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'video') {
         setVideoUri(result.assets[0].uri);
         updateProfile({ videoUri: result.assets[0].uri });
      } else {
         setPhotoUri(result.assets[0].uri);
         updateProfile({ image: result.assets[0].uri });
      }
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    
    if (!result.canceled) {
      setResumeName(result.assets[0].name);
      updateProfile({ resumeName: result.assets[0].name, resumeUri: result.assets[0].uri });
    }
  };

  if (!activeProfile) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => pickMedia('image')}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Camera color="#94a3b8" size={32} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Camera color="#fff" size={12} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{activeProfile.name || activeProfile.company}</Text>
        <Text style={styles.title}>{activeProfile.title}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>{activeProfile.bio || activeProfile.description}</Text>
      </View>

      {/* Skills & Experience Info Panel */}
      <View style={styles.card}>
         <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Experience Level</Text>
            <Text style={styles.highlightText}>{activeProfile.experience || 'Mid-Level'}</Text>
         </View>
         <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Desired Comp</Text>
            <Text style={styles.highlightText}>{activeProfile.salary || '$120k - $140k'}</Text>
         </View>
         
         <Text style={[styles.sectionTitle, {marginTop: 16}]}>Core Skills</Text>
         <View style={styles.skills}>
           {(activeProfile.skills || activeProfile.skillsReq || ['React Native', 'TypeScript', 'Node.js', 'GraphQL']).map((s, idx) => (
              <View key={idx} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
           ))}
         </View>
      </View>

      {/* Ghost Mode & Video Profile Section */}
      {activeProfile.role === 'SEEKER' && (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identity & Media</Text>
        
        <TouchableOpacity style={[styles.ghostBtn, activeProfile?.isGhost && styles.ghostBtnActive]} onPress={toggleGhostMode}>
           <EyeOff size={20} color={activeProfile?.isGhost ? "#fff" : "#0ea5e9"} />
           <Text style={[styles.ghostBtnText, activeProfile?.isGhost && {color: '#fff'}]}>
             {activeProfile?.isGhost ? "Ghost Mode: ON (Hidden)" : "Enable Ghost Mode (Hide Identity)"}
           </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickMedia('video')}>
          <Video color="#000" size={20} style={{marginRight: 8}} />
          <Text style={styles.uploadBtnText}>{videoUri ? "Update Video Reel" : "Upload Video Pitch"}</Text>
        </TouchableOpacity>
      </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{activeProfile.role === 'SEEKER' ? 'My Resume' : 'Company Prospectus'}</Text>
        {resumeName ? (
           <View style={styles.resumeBox}>
             <FileText color="#d946ef" size={24} />
             <Text style={styles.resumeText}>{resumeName}</Text>
           </View>
        ) : (
          <Text style={styles.text}>No document uploaded yet.</Text>
        )}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
          <Text style={styles.uploadBtnText}>Upload PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0ea5e9',
  },
  placeholderAvatar: {
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0ea5e9',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  highlightText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700'
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  tagText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600'
  },
  resumeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  resumeText: {
    marginLeft: 12,
    color: '#fff',
    fontWeight: '700',
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadBtnText: {
    color: '#000',
    fontWeight: '800',
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    marginBottom: 12,
    justifyContent: 'center'
  },
  ghostBtnActive: {
    backgroundColor: '#0ea5e9',
  },
  ghostBtnText: {
    color: '#0ea5e9',
    fontWeight: '800',
    marginLeft: 12,
  }
});
