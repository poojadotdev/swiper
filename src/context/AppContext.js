import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(null); 
  const [activeProfile, setActiveProfile] = useState(null); 
  
  // Storage states
  const [usersDB, setUsersDB] = useState({});
  const [likes, setLikes] = useState({}); 
  const [matches, setMatches] = useState([]);
  const [chatHistories, setChatHistories] = useState({});
  const [kanbanStatuses, setKanbanStatuses] = useState({});
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        await AsyncStorage.clear(); // FORCE WIPE TO SUPPORT NEW STRUCTURES
        
        const storedUsersStr = await AsyncStorage.getItem('@swiper_users');
        const storedLikesStr = await AsyncStorage.getItem('@swiper_likes');
        const storedMatchesStr = await AsyncStorage.getItem('@swiper_matches');
        const storedChatsStr = await AsyncStorage.getItem('@swiper_chats');
        const storedKanbanStr = await AsyncStorage.getItem('@swiper_kanban');
        
        let loadedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : null;
        let loadedLikes = storedLikesStr ? JSON.parse(storedLikesStr) : {};
        let loadedMatches = storedMatchesStr ? JSON.parse(storedMatchesStr) : [];
        let loadedChats = storedChatsStr ? JSON.parse(storedChatsStr) : {};
        let loadedKanban = storedKanbanStr ? JSON.parse(storedKanbanStr) : {};

        // SEEDING LOGIC: If database lacks the demo credentials, seed them
        if (!loadedUsers || !loadedUsers['jake_dev']) {
          console.log("Seeding Demo data...");
          
          if (!loadedUsers) loadedUsers = {};
          
          const seedSeeker = {
            id: 'jake_dev',
            role: 'SEEKER',
            name: 'Jake Towel',
            title: 'Senior Engineer',
            bio: 'Expert in React Native, Web Apps, and scaling systems.',
            skills: ['React Native', 'TypeScript', 'Node.js', 'System Design'],
            experience: '8 years',
            location: 'San Francisco, CA',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80'
          };
          
          const seedRecruiterJob = {
            id: 'tech_recruiter',
            role: 'RECRUITER',
            title: 'Lead Mobile Engineer',
            company: 'NextGen Tech',
            location: 'San Francisco, CA',
            salary: '$160k - $210k',
            description: 'We need an experienced leader to architect our next-gen mobile application.',
            skillsReq: ['React Native', 'Leadership', 'TypeScript', 'System Design'],
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
          };

          loadedUsers = { 'jake_dev': seedSeeker, 'tech_recruiter': seedRecruiterJob };
          await AsyncStorage.setItem('@swiper_users', JSON.stringify(loadedUsers));
        }

        setUsersDB(loadedUsers);
        setLikes(loadedLikes);
        setMatches(loadedMatches);
        setChatHistories(loadedChats);
        setKanbanStatuses(loadedKanban);
        setIsLoaded(true);

      } catch (e) {
        console.error("Failed to load state", e);
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  const saveDatabase = async (newDB) => {
    try {
      setUsersDB(newDB);
      await AsyncStorage.setItem('@swiper_users', JSON.stringify(newDB));
    } catch (e) { console.error(e); }
  };

  const registerUser = async (profile) => {
    const newDB = { ...usersDB, [profile.id]: profile };
    await saveDatabase(newDB);
    loginUser(profile.id);
  };

  const loginUser = (username) => {
    const user = usersDB[username];
    if (user) {
      setRole(user.role);
      setActiveProfile(user);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setRole(null);
    setActiveProfile(null);
  };

  const resetDatabase = async () => {
    await AsyncStorage.clear();
    setUsersDB({});
    setLikes({});
    setMatches([]);
    setChatHistories({});
    setKanbanStatuses({});
    logout();
  };

  const seedDummies = async () => {
    const seedSeeker = {
      id: 'jake_dev',
      role: 'SEEKER',
      name: 'Jake Towel',
      title: 'Senior Engineer',
      bio: 'Expert in React Native, Web Apps, and scaling systems.',
      skills: ['React Native', 'TypeScript', 'Node.js', 'System Design'],
      experience: '8 years',
      location: 'San Francisco, CA',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80'
    };
    
    const seedRecruiterJob = {
      id: 'tech_recruiter',
      role: 'RECRUITER',
      title: 'Lead Mobile Engineer',
      company: 'NextGen Tech',
      location: 'San Francisco, CA',
      salary: '$160k - $210k',
      description: 'We need an experienced leader to architect our next-gen mobile application.',
      skillsReq: ['React Native', 'Leadership', 'TypeScript', 'System Design'],
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    };

    const newDB = { ...usersDB, 'jake_dev': seedSeeker, 'tech_recruiter': seedRecruiterJob };
    await saveDatabase(newDB);
  };

  const updateProfile = async (updatedFields) => {
    const updatedProfile = { ...activeProfile, ...updatedFields };
    const newDB = { ...usersDB, [activeProfile.id]: updatedProfile };
    setActiveProfile(updatedProfile);
    await saveDatabase(newDB);
  };

  const addLike = async (candidateId, jobId, sourceRole) => {
    const key = `${candidateId}-${jobId}`;
    
    let updatedLikes = { ...likes };
    let updatedMatches = [...matches];

    const existingLike = updatedLikes[key];
    
    // If the other party already liked, it's a mutual match!
    if (existingLike && existingLike !== sourceRole) {
      const isAlreadyMatched = updatedMatches.some(m => m.candidateId === candidateId && m.jobId === jobId);
      if (!isAlreadyMatched) {
        const newMatchInfo = { candidateId, jobId, generatedResponse: false };
        updatedMatches.push(newMatchInfo);
        setMatches(updatedMatches);
        await AsyncStorage.setItem('@swiper_matches', JSON.stringify(updatedMatches));

        // Generate AI Pitch Placement mock for the chat seamlessly
        const matchKey = `${candidateId}-${jobId}`;
        const autoMsg = {
          id: Date.now().toString(),
          role: 'SYSTEM',
          message: `✨ AI PITCH:\nThis candidate is an outstanding 85% match for your technical stack. Consider interviewing them!`,
          isAI: true
        };
        const updatedChats = { ...chatHistories, [matchKey]: [autoMsg] };
        setChatHistories(updatedChats);
        await AsyncStorage.setItem('@swiper_chats', JSON.stringify(updatedChats));
        
        const updatedKanban = { ...kanbanStatuses, [matchKey]: 'MATCHED' };
        setKanbanStatuses(updatedKanban);
        await AsyncStorage.setItem('@swiper_kanban', JSON.stringify(updatedKanban));
      }
    } else {
      updatedLikes[key] = sourceRole;
      setLikes(updatedLikes);
      await AsyncStorage.setItem('@swiper_likes', JSON.stringify(updatedLikes));
    }
  };

  const getMatchesForRecruiter = (jobId) => {
    return matches.filter(m => m.jobId === jobId); 
  };
  
  const getMatchesForSeeker = (candidateId) => {
      return matches.filter(m => m.candidateId === candidateId);
  }

  const updateKanbanStatus = async (matchKey, newStatus) => {
    const updated = { ...kanbanStatuses, [matchKey]: newStatus };
    setKanbanStatuses(updated);
    await AsyncStorage.setItem('@swiper_kanban', JSON.stringify(updated));
  }

  const addChatMessage = async (matchKey, text, senderRole) => {
    const msg = { id: Date.now().toString(), role: senderRole, message: text };
    const list = chatHistories[matchKey] || [];
    const updatedChats = { ...chatHistories, [matchKey]: [...list, msg] };
    setChatHistories(updatedChats);
    await AsyncStorage.setItem('@swiper_chats', JSON.stringify(updatedChats));
  }

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        role,
        activeProfile,
        usersDB,
        registerUser,
        updateProfile,
        loginUser,
        logout,
        resetDatabase,
        seedDummies,
        addLike,
        matches,
        getMatchesForRecruiter,
        getMatchesForSeeker,
        chatHistories,
        addChatMessage,
        kanbanStatuses,
        updateKanbanStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
