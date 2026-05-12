import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { MOCK_CANDIDATES, MOCK_JOBS } from '../data/mockData';

export default function LoginScreen() {
  const { loginUser, registerUser, resetDatabase, seedDummies } = useAppContext();
  
  const [mode, setMode] = useState('CHOICE'); // CHOICE, LOGIN, REG_SEEKER, REG_RECRUITER
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  const handleLogin = () => {
    if (!username.trim()) return Alert.alert("Error", "Please enter a username.");
    const success = loginUser(username.toLowerCase().trim());
    if (!success) {
      Alert.alert("Not Found", "Account not found. Please register first.");
    }
  };

  const handleRegisterSeeker = () => {
    if (!username.trim() || !name || !title) return Alert.alert("Error", "Fill required fields");
    
    const newProfile = {
      id: username.toLowerCase().trim(),
      role: 'SEEKER',
      name,
      title,
      bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      experience: '0 years', // default mock
      location: 'Remote',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    };
    registerUser(newProfile);
  };

  const handleRegisterRecruiter = () => {
    if (!username.trim() || !company || !title) return Alert.alert("Error", "Fill required fields");
    
    // For recruiters, the profile acts as the Job Posting they are hiring for
    const newJobProfile = {
      id: username.toLowerCase().trim(),
      role: 'RECRUITER',
      title,
      company,
      location: 'Remote',
      salary: 'Competitive',
      description: bio,
      skillsReq: skills.split(',').map(s => s.trim()).filter(Boolean),
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
    };
    registerUser(newJobProfile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Swiper</Text>
            <Text style={styles.subtitle}>Find your next match.</Text>
          </View>

          {mode === 'CHOICE' && (
            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, styles.primaryBtn]} onPress={() => setMode('LOGIN')}>
                <Text style={[styles.buttonText, {color: '#fff'}]}>Log In (Existing User)</Text>
              </TouchableOpacity>
              
              <Text style={{textAlign: 'center', marginVertical: 12, color: '#666'}}>OR CREATE ACCOUNT</Text>

              <TouchableOpacity style={[styles.button, styles.outlineBtn]} onPress={() => setMode('REG_SEEKER')}>
                <Text style={styles.buttonText}>Register as Job Seeker</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.outlineBtn]} onPress={() => setMode('REG_RECRUITER')}>
                <Text style={styles.buttonText}>Register as Recruiter</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{marginTop: 32, alignItems: 'center'}} onPress={() => {
                resetDatabase();
                Alert.alert("Data Cleared", "All swiping history and accounts have been wiped.");
              }}>
                <Text style={{color: '#ef4444', fontWeight: 'bold', fontSize: 16}}>⚠️ Clear All Local Data</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{marginTop: 16, alignItems: 'center'}} onPress={() => {
                seedDummies();
                Alert.alert("Dummies Created", "The users 'jake_dev' and 'tech_recruiter' are now available for testing!");
              }}>
                <Text style={{color: '#38bdf8', fontWeight: 'bold', fontSize: 16}}>✨ Generate Dummies</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'LOGIN' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Log In</Text>
              <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
              <TouchableOpacity style={[styles.button, styles.primaryBtn]} onPress={handleLogin}>
                <Text style={[styles.buttonText, {color: '#fff'}]}>Enter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{marginTop: 16}} onPress={() => setMode('CHOICE')}>
                <Text style={{textAlign: 'center', color: '#666'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'REG_SEEKER' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create Seeker Profile</Text>
              <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Your Title (e.g. Frontend Dev)" value={title} onChangeText={setTitle} />
              <TextInput style={styles.input} placeholder="Skills (comma separated)" value={skills} onChangeText={setSkills} />
              <TextInput style={[styles.input, {height: 80}]} placeholder="Short Bio" multiline value={bio} onChangeText={setBio} />

              <TouchableOpacity style={[styles.button, styles.primaryBtn, {marginTop: 12}]} onPress={handleRegisterSeeker}>
                <Text style={[styles.buttonText, {color: '#fff'}]}>Create Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{marginTop: 16}} onPress={() => setMode('CHOICE')}>
                <Text style={{textAlign: 'center', color: '#666'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'REG_RECRUITER' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create Recruiter Profile</Text>
              <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Company Name" value={company} onChangeText={setCompany} />
              <TextInput style={styles.input} placeholder="Job Title Hiring For" value={title} onChangeText={setTitle} />
              <TextInput style={styles.input} placeholder="Required Skills (comma separated)" value={skills} onChangeText={setSkills} />
              <TextInput style={[styles.input, {height: 80}]} placeholder="Job Description" multiline value={bio} onChangeText={setBio} />

              <TouchableOpacity style={[styles.button, styles.primaryBtn, {marginTop: 12}]} onPress={handleRegisterRecruiter}>
                <Text style={[styles.buttonText, {color: '#fff'}]}>Create Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{marginTop: 16}} onPress={() => setMode('CHOICE')}>
                <Text style={{textAlign: 'center', color: '#666'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' }, // Very dark blue bg
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 48, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 18, color: '#38bdf8', fontWeight: '500' }, // sky blue subtitle
  buttons: { gap: 16 },
  form: { gap: 12, backgroundColor: '#0f172a', padding: 24, borderRadius: 0, borderWidth: 1, borderColor: '#1e293b' },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 12 },
  input: { backgroundColor: '#1e293b', padding: 16, borderRadius: 0, borderWidth: 1, borderColor: '#334155', fontSize: 16, color: '#e2e8f0' },
  button: { paddingVertical: 16, borderRadius: 0, alignItems: 'center' },
  primaryBtn: { backgroundColor: '#2563eb' }, // standard blue
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#0ea5e9' },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#fff' }, 
});
