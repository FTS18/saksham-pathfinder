import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const createDemoRecruiterAndInternships = async () => {
  try {
    // Create demo recruiter account
    const recruiterId = 'demo-recruiter-123';
    const recruiterData = {
      uniqueUserId: 'DEMO001',
      email: 'admin@demo.com',
      displayName: 'Demo Admin',
      userType: 'recruiter',
      company: 'Demo Tech Solutions',
      position: 'HR Manager',
      companySize: '201-1000',
      industry: 'Technology',
      location: 'Bangalore, India',
      website: 'https://demo-tech.com',
      phone: '+91 9876543210',
      description: 'Leading technology company focused on innovation and growth.',
      hiringNeeds: 'Looking for talented interns in software development, data science, and digital marketing.',
      createdAt: new Date(),
      onboardingCompleted: true,
      emailVerified: true
    };

    await setDoc(doc(db, 'recruiters', recruiterId), recruiterData);

    // Create 5 demo internships
    const internships = [
      {
        title: 'Frontend Developer Intern',
        company: 'Microsoft',
        description: 'Work on cutting-edge web applications using React, TypeScript, and modern development tools. You will collaborate with senior developers to build user-friendly interfaces and contribute to our flagship products.',
        duration: '6 months',
        stipend: '₹45,000/month',
        location: 'Hyderabad',
        requirements: ['Bachelor\'s degree in Computer Science', 'Strong problem-solving skills', 'Good communication skills'],
        skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Git'],
        sector: 'Technology',
        type: 'internship' as const,
        status: 'active' as const,
        recruiterId,
        recruiterName: 'Demo Admin',
        recruiterEmail: 'admin@demo.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 23
      },
      {
        title: 'Data Science Intern',
        company: 'Google',
        description: 'Join our data science team to work on machine learning models, data analysis, and AI-driven solutions. You will work with large datasets and contribute to products used by millions of users worldwide.',
        duration: '4 months',
        stipend: '₹55,000/month',
        location: 'Bangalore',
        requirements: ['Bachelor\'s degree in relevant field', 'Knowledge of statistics', 'Programming experience'],
        skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'NumPy', 'TensorFlow'],
        sector: 'Technology',
        type: 'internship' as const,
        status: 'active' as const,
        recruiterId,
        recruiterName: 'Demo Admin',
        recruiterEmail: 'admin@demo.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 45
      },
      {
        title: 'Digital Marketing Intern',
        company: 'Amazon',
        description: 'Support our marketing team in creating and executing digital marketing campaigns. You will work on social media marketing, content creation, SEO optimization, and performance analytics.',
        duration: '3 months',
        stipend: '₹25,000/month',
        location: 'Mumbai',
        requirements: ['Bachelor\'s degree in Marketing or related field', 'Creative thinking', 'Analytical mindset'],
        skills: ['Digital Marketing', 'SEO', 'Social Media', 'Content Writing', 'Google Analytics', 'Adobe Creative Suite'],
        sector: 'Marketing',
        type: 'internship' as const,
        status: 'active' as const,
        recruiterId,
        recruiterName: 'Demo Admin',
        recruiterEmail: 'admin@demo.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 18
      },
      {
        title: 'Mobile App Developer Intern',
        company: 'Flipkart',
        description: 'Develop mobile applications for Android and iOS platforms. You will work with cross-functional teams to create engaging mobile experiences and contribute to our e-commerce platform.',
        duration: '5 months',
        stipend: '₹35,000/month',
        location: 'Bangalore',
        requirements: ['Bachelor\'s degree in Computer Science', 'Mobile development experience', 'Team collaboration skills'],
        skills: ['React Native', 'Flutter', 'Android', 'iOS', 'JavaScript', 'Dart'],
        sector: 'Technology',
        type: 'internship' as const,
        status: 'active' as const,
        recruiterId,
        recruiterName: 'Demo Admin',
        recruiterEmail: 'admin@demo.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 31
      },
      {
        title: 'UI/UX Design Intern',
        company: 'Zomato',
        description: 'Create intuitive and visually appealing user interfaces for our food delivery platform. You will work on user research, wireframing, prototyping, and visual design to enhance user experience.',
        duration: '4 months',
        stipend: '₹30,000/month',
        location: 'Delhi',
        requirements: ['Bachelor\'s degree in Design or related field', 'Portfolio of design work', 'User-centered design thinking'],
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Visual Design'],
        sector: 'Design',
        type: 'internship' as const,
        status: 'active' as const,
        recruiterId,
        recruiterName: 'Demo Admin',
        recruiterEmail: 'admin@demo.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 27
      }
    ];

    // Add internships to Firestore
    for (const internship of internships) {
      await addDoc(collection(db, 'internships'), internship);
    }

    console.log('Demo data created successfully!');
    return { success: true, message: 'Demo recruiter and 5 internships created successfully!' };
  } catch (error) {
    console.error('Error creating demo data:', error);
    return { success: false, message: 'Failed to create demo data' };
  }
};