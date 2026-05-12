import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  error: '#F44336',
};

// Mock data
const values = [
  {
    title: 'Sustainability',
    description: 'Promoting eco-friendly farming practices and environmental stewardship',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    title: 'Community',
    description: 'Building a network of farmers, merchants, and consumers across Ethiopia',
    icon: 'people',
    color: '#2196F3',
  },
  {
    title: 'Growth',
    description: 'Enabling economic growth and agricultural development in rural areas',
    icon: 'trending-up',
    color: '#9C27B0',
  },
  {
    title: 'Trust',
    description: 'Creating transparent and reliable marketplace for agricultural products',
    icon: 'shield-checkmark',
    color: '#FF9800',
  },
  {
    title: 'Innovation',
    description: 'Leveraging technology to modernize Ethiopian agriculture',
    icon: 'globe',
    color: '#673AB7',
  },
  {
    title: 'Impact',
    description: 'Making a measurable difference in farmers\' lives and communities',
    icon: 'heart',
    color: '#F44336',
  },
];

const team = [
  {
    name: 'Haile Abebe',
    role: 'Founder & CEO',
    bio: 'Agricultural economist with 15+ years experience in Ethiopian farming systems',
    image: '👨‍🌾',
  },
  {
    name: 'Gelasa Jarso',
    role: 'CTO & Co-Founder',
    bio: 'Software engineer specializing in agricultural technology and supply chain management',
    image: '👩‍💻',
  },
  {
    name: 'Kaleab Lagese',
    role: 'Head of Operations',
    bio: 'Expert in agricultural logistics and farmer relations with deep knowledge of Ethiopian regions',
    image: '👨‍🌾',
  },
  {
    name: 'Kaleab Tasfaneh',
    role: 'Head of Product',
    bio: 'Agricultural product specialist focused on quality control and market access for farmers',
    image: '👩‍🌾',
  },
  {
    name: 'Hawa Mohammad',
    role: 'Community Manager',
    bio: 'Building farmer communities and providing training on sustainable farming practices',
    image: '👩‍🌾',
  },
];

const milestones = [
  {
    year: '2022',
    event: 'FarmConnect founded with mission to connect Ethiopian farmers to markets',
  },
  {
    year: '2023',
    event: 'Launched mobile app and expanded to 5 Ethiopian regions',
  },
  {
    year: '2024',
    event: 'Reached 10,000+ farmers and 15,000+ transactions milestone',
  },
  {
    year: '2025',
    event: 'Expanded to international markets and launched AI agronomist feature',
  },
];

const impactStats = [
  { value: '2,500+', label: 'Active Farmers' },
  { value: '15,000+', label: 'Monthly Transactions' },
  { value: '10', label: 'Ethiopian Regions' },
  { value: '50M+', label: 'Total Volume (ETB)' },
];

export default function AboutScreen() {
  const renderValueCard = (item: typeof values[0]) => (
    <View style={styles.valueCard}>
      <View style={[styles.valueIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color={G.white} />
      </View>
      <Text style={styles.valueTitle}>{item.title}</Text>
      <Text style={styles.valueDescription}>{item.description}</Text>
    </View>
  );

  const renderTeamMember = (member: typeof team[0]) => (
    <View style={styles.teamMember}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberEmoji}>{member.image}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberBio}>{member.bio}</Text>
      </View>
    </View>
  );

  const renderMilestone = (item: typeof milestones[0], index: number) => (
    <View style={styles.milestone}>
      <View style={styles.milestoneYear}>
        <Text style={styles.milestoneYearText}>{item.year}</Text>
      </View>
      <View style={styles.milestoneContent}>
        <Text style={styles.milestoneEvent}>{item.event}</Text>
      </View>
      {index < milestones.length - 1 && (
        <View style={styles.milestoneLine} />
      )}
    </View>
  );

  const renderImpactStat = (stat: typeof impactStats[0]) => (
    <View style={styles.impactStat}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>About FarmConnect</Text>
          <Text style={styles.subtitle}>
            Connecting Ethiopian farmers to markets through technology and innovation
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Empowering Ethiopian Agriculture</Text>
          <Text style={styles.heroSubtitle}>
            Building sustainable supply chains and creating economic opportunities for farmers across Ethiopia
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <Text style={styles.sectionSubtitle}>
            The principles that guide everything we do
          </Text>
          <View style={styles.valuesGrid}>
            {values.map(renderValueCard)}
          </View>
        </View>

        {/* Impact Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <Text style={styles.sectionSubtitle}>
            Making a measurable difference in Ethiopian agriculture
          </Text>
          <View style={styles.impactGrid}>
            {impactStats.map(renderImpactStat)}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.sectionSubtitle}>
            The dedicated team behind FarmConnect's mission
          </Text>
          <View style={styles.teamList}>
            {team.map(renderTeamMember)}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Key milestones in our mission to transform Ethiopian agriculture
          </Text>
          <View style={styles.milestonesList}>
            {milestones.map(renderMilestone)}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Join Our Mission</Text>
          <Text style={styles.ctaSubtitle}>
            Be part of the agricultural revolution in Ethiopia
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 FarmConnect. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: G.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    textAlign: 'center',
    lineHeight: 20,
  },
  hero: {
    backgroundColor: G.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: G.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: G.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: G.sub,
    marginBottom: 20,
    lineHeight: 20,
  },
  valuesGrid: {
    gap: 16,
  },
  valueCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 13,
    color: G.sub,
    lineHeight: 18,
    flex: 1,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  impactStat: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    textAlign: 'center',
  },
  teamList: {
    gap: 16,
  },
  teamMember: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberEmoji: {
    fontSize: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 13,
    color: G.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  memberBio: {
    fontSize: 13,
    color: G.sub,
    lineHeight: 18,
  },
  milestonesList: {
    gap: 16,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneYear: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  milestoneYearText: {
    fontSize: 14,
    fontWeight: '700',
    color: G.white,
  },
  milestoneContent: {
    flex: 1,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  milestoneLine: {
    position: 'absolute',
    left: -8,
    top: 30,
    width: 16,
    height: 2,
    backgroundColor: G.border,
  },
  milestoneEvent: {
    fontSize: 14,
    color: G.text,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: G.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.white,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: G.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.primary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: G.border,
  },
  footerText: {
    fontSize: 12,
    color: G.sub,
  },
});
