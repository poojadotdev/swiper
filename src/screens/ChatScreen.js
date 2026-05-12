import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, SafeAreaView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { MOCK_CANDIDATES, MOCK_JOBS } from '../data/mockData';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react-native';

export default function ChatScreen() {
  const { role, activeProfile, chatHistories, getMatchesForRecruiter, getMatchesForSeeker, addChatMessage, usersDB } = useAppContext();
  
  const [activeMatchKey, setActiveMatchKey] = useState(null);
  const [inputText, setInputText] = useState('');

  const allCandidates = [...MOCK_CANDIDATES, ...Object.values(usersDB || {}).filter(u => u.role === 'SEEKER')];
  const allJobs = [...MOCK_JOBS, ...Object.values(usersDB || {}).filter(u => u.role === 'RECRUITER')];

  let rawMatches = [];
  if (role === 'RECRUITER') {
    rawMatches = getMatchesForRecruiter(activeProfile.id);
  } else {
    rawMatches = getMatchesForSeeker(activeProfile.id);
  }

  const handleSend = () => {
    if (inputText.trim() === '') return;
    addChatMessage(activeMatchKey, inputText, role);
    setInputText('');
  };

  const activeChatProfile = React.useMemo(() => {
     if (!activeMatchKey) return null;
     const [cId, jId] = activeMatchKey.split('-');
     if (role === 'RECRUITER') return allCandidates.find(c => c.id === cId);
     return allJobs.find(j => j.id === jId);
  }, [activeMatchKey, role, allCandidates, allJobs]);

  if (activeMatchKey && activeChatProfile) {
    const messages = chatHistories[activeMatchKey] || [];
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
           <TouchableOpacity onPress={() => setActiveMatchKey(null)} style={{padding: 8}}>
              <ArrowLeft color="#fff" size={24} />
           </TouchableOpacity>
           <Image source={{uri: activeChatProfile.image}} style={styles.avatarSmall} />
           <Text style={styles.chatHeaderName}>{role === 'RECRUITER' ? activeChatProfile.name : activeChatProfile.company}</Text>
        </View>

        <FlatList
           data={messages}
           keyExtractor={msg => msg.id}
           contentContainerStyle={styles.messageList}
           renderItem={({item}) => {
             const isMe = item.role === role;
             const isSystem = item.role === 'SYSTEM';
             return (
               <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapRight : styles.bubbleWrapLeft, isSystem && styles.bubbleWrapSystem]}>
                 <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, isSystem && styles.bubbleSystem]}>
                   <Text style={[styles.bubbleText, isSystem && styles.bubbleTextSystem]}>{item.message}</Text>
                 </View>
               </View>
             )
           }}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Messages</Text>
      {rawMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={64} color="#1e293b" style={{marginBottom: 24}} />
          <Text style={styles.emptyText}>No Active Chats</Text>
          <Text style={styles.emptySub}>Match with someone to initiate an AI-placed pitch chat.</Text>
        </View>
      ) : (
        <FlatList
          data={rawMatches}
          keyExtractor={item => `${item.candidateId}-${item.jobId}`}
          contentContainerStyle={{padding: 20}}
          renderItem={({item}) => {
             const matchKey = `${item.candidateId}-${item.jobId}`;
             const isRecruiter = role === 'RECRUITER';
             const profile = isRecruiter 
                ? allCandidates.find(c => c.id === item.candidateId) 
                : allJobs.find(j => j.id === item.jobId);
                
             if (!profile) return null;
             
             const msgs = chatHistories[matchKey] || [];
             const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].message : 'Tap to open chat...';

             return (
               <TouchableOpacity style={styles.inboxItem} onPress={() => setActiveMatchKey(matchKey)}>
                 <Image source={{ uri: profile.image }} style={styles.avatarLarge} />
                 <View style={{flex: 1}}>
                    <Text style={styles.inboxName}>{isRecruiter ? profile.name : profile.company}</Text>
                    <Text style={styles.inboxPreview} numberOfLines={1}>{lastMsg}</Text>
                 </View>
               </TouchableOpacity>
             );
          }}
        />
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  emptySub: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  inboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    marginBottom: 12
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#334155',
    marginRight: 16
  },
  inboxName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4
  },
  inboxPreview: {
    color: '#94a3b8',
    fontSize: 14
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a'
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 0,
    marginHorizontal: 12
  },
  chatHeaderName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18
  },
  messageList: {
    padding: 16,
    gap: 12
  },
  bubbleWrap: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleWrapRight: {
    justifyContent: 'flex-end',
  },
  bubbleWrapLeft: {
    justifyContent: 'flex-start',
  },
  bubbleWrapSystem: {
    justifyContent: 'center'
  },
  bubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 0
  },
  bubbleSystem: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed'
  },
  bubbleMe: {
    backgroundColor: '#2563eb',
  },
  bubbleThem: {
    backgroundColor: '#1e293b'
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22
  },
  bubbleTextSystem: {
    color: '#38bdf8',
    fontStyle: 'italic',
    fontWeight: '600'
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
