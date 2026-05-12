import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  Dimensions,
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
const stats = [
  { value: '2,500+', label: 'Sustainable Farmers', icon: 'leaf' },
  { value: '50,000+', label: 'Trees Planted', icon: 'tree' },
  { value: '30%', label: 'Water Saved', icon: 'water' },
  { value: '25%', label: 'Waste Reduced', icon: 'recycle' },
];

const commitments = [
  {
    icon: 'leaf',
    title: 'Organic Farming',
    description: 'Promote chemical-free agricultural practices',
    impact: 'Healthier soil & products',
    color: '#4CAF50',
  },
  {
    icon: 'water',
    title: 'Water Conservation',
    description: 'Implement efficient irrigation systems',
    impact: '30% reduction in water usage',
    color: '#2196F3',
  },
  {
    icon: 'recycle',
    title: 'Waste Reduction',
    description: 'Composting and recycling programs',
    impact: '25% less agricultural waste',
    color: '#FF9800',
  },
  {
    icon: 'sunny',
    title: 'Solar Energy',
    description: 'Solar-powered farming equipment',
    impact: 'Clean energy operations',
    color: '#FFB300',
  },
  {
    icon: 'cloud',
    title: 'Carbon Neutral',
    description: 'Carbon offset initiatives',
    impact: 'Zero carbon footprint goal',
    color: '#9C27B0',
  },
  {
    icon: 'tree',
    title: 'Reforestation',
    description: 'Tree planting programs',
    impact: '50,000+ trees planted',
    color: '#388E3C',
  },
];

const practices = [
  {
    title: 'Crop Rotation',
    description: 'Alternating crops to improve soil health',
    benefit: 'Better soil fertility',
  },
  {
    title: 'Composting',
    description: 'Natural fertilizer production',
    benefit: 'Reduced chemical use',
  },
  {
    title: 'Integrated Pest Management',
    description: 'Natural pest control methods',
    benefit: 'Less pesticide usage',
  },
  {
    title: 'Cover Cropping',
    description: 'Protecting soil during off-seasons',
    benefit: 'Prevents soil erosion',
  },
];

const milestones = [
  {
    year: '2022',
    achievement: 'Sustainability program launched',
    farmers: '500 farmers joined',
  },
  {
    year: '2023',
    achievement: 'Organic certification achieved',
    farmers: '1,200 farmers certified',
  },
  {
    year: '2024',
    achievement: 'Carbon neutral operations',
    farmers: '2,000 farmers participating',
  },
  {
    year: '2025',
    achievement: 'Regional expansion',
    farmers: '2,500+ farmers nationwide',
  },
];

const goals = [
  'Achieve 100% organic farming by 2026',
  'Reduce water usage by 50% across all farms',
  'Plant 100,000 trees by end of 2025',
  'Eliminate single-use plastics in packaging',
];

export default function SustainabilityScreen() {
  const renderStatCard = (stat: typeof stats[0]) => (
    <View key={stat.label} style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={stat.icon as any} size={20} color={G.white} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderCommitment = (commitment: typeof commitments[0]) => (
    <View key={commitment.title} style={styles.commitmentCard}>
      <View style={[styles.commitmentIcon, { backgroundColor: commitment.color }]}>
        <Ionicons name={commitment.icon as any} size={24} color={G.white} />
      </View>
      <Text style={styles.commitmentTitle}>{commitment.title}</Text>
      <Text style={styles.commitmentDescription}>{commitment.description}</Text>
      <View style={styles.commitmentImpact}>
        <Ionicons name="trending-up" size={14} color={commitment.color} />
        <Text style={[styles.commitmentImpactText, { color: commitment.color }]}>
          {commitment.impact}
        </Text>
      </View>
    </View>
  );

  const renderPractice = (practice: typeof practices[0], index: number) => (
    <View key={practice.title} style={styles.practiceCard}>
      <View style={styles.practiceNumber}>
        <Text style={styles.practiceNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.practiceContent}>
        <Text style={styles.practiceTitle}>{practice.title}</Text>
        <Text style={styles.practiceDescription}>{practice.description}</Text>
        <View style={styles.practiceBenefit}>
          <Ionicons name="heart" size={14} color={G.success} />
          <Text style={styles.practiceBenefitText}>{practice.benefit}</Text>
        </View>
      </View>
    </View>
  );

  const renderMilestone = (milestone: typeof milestones[0], index: number) => (
    <View key={milestone.year} style={styles.milestoneContainer}>
      <View style={[
        styles.milestoneDot,
        index % 2 === 0 ? styles.milestoneLeft : styles.milestoneRight
      ]}>
        <Text style={styles.milestoneYear}>{milestone.year}</Text>
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneAchievement}>{milestone.achievement}</Text>
          <Text style={styles.milestoneFarmers}>{milestone.farmers}</Text>
        </View>
      </View>
      {index < milestones.length - 1 && (
        <View style={[
          styles.milestoneLine,
          index % 2 === 0 ? styles.milestoneLineLeft : styles.milestoneLineRight
        ]} />
      )}
    </View>
  );

  const renderGoal = (goal: string, index: number) => (
    <View key={goal} style={styles.goalItem}>
      <View style={styles.goalIcon}>
        <Ionicons name="checkmark" size={14} color={G.white} />
      </View>
      <Text style={styles.goalText}>{goal}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="leaf" size={32} color={G.success} />
            <Text style={styles.title}>Sustainability</Text>
          </View>
          <Text style={styles.subtitle}>
            Building a greener future for Ethiopian agriculture
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map(renderStatCard)}
        </View>

        {/* Commitments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Commitments</Text>
          <Text style={styles.sectionSubtitle}>
            Promoting sustainable agricultural practices across Ethiopia
          </Text>
          <View style={styles.commitmentsGrid}>
            {commitments.map(renderCommitment)}
          </View>
        </View>

        {/* Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustainable Practices</Text>
          <Text style={styles.sectionSubtitle}>
            Teaching farmers environmentally friendly farming methods
          </Text>
          <View style={styles.practicesList}>
            {practices.map(renderPractice)}
          </View>
        </View>

        {/* Journey Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Milestones in our sustainability mission
          </Text>
          <View style={styles.timeline}>
            {milestones.map(renderMilestone)}
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Future Goals</Text>
          <Text style={styles.sectionSubtitle}>
            Our targets for a sustainable agricultural future
          </Text>
          <View style={styles.goalsList}>
            {goals.map(renderGoal)}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Ionicons name="leaf" size={48} color={G.success} />
          <Text style={styles.ctaTitle}>Join Our Green Movement</Text>
          <Text style={styles.ctaSubtitle}>
            Be part of Ethiopia's sustainable agricultural revolution
          </Text>
          <View style={styles.ctaButtons}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </View>
            <View style={[styles.ctaButton, styles.ctaButtonSecondary]}>
              <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>
                Learn More
              </Text>
            </View>
          </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (Dimensions.get('window').width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: G.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: G.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: G.sub,
    lineHeight: 20,
    marginBottom: 20,
  },
  commitmentsGrid: {
    gap: 16,
  },
  commitmentCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commitmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  commitmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: G.text,
    marginBottom: 8,
  },
  commitmentDescription: {
    fontSize: 14,
    color: G.sub,
    lineHeight: 20,
    marginBottom: 12,
  },
  commitmentImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commitmentImpactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  practicesList: {
    gap: 16,
  },
  practiceCard: {
    flexDirection: 'row',
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: G.primary,
  },
  practiceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  practiceNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: G.white,
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  practiceDescription: {
    fontSize: 14,
    color: G.sub,
    lineHeight: 20,
    marginBottom: 8,
  },
  practiceBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  practiceBenefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: G.success,
  },
  timeline: {
    paddingLeft: 20,
  },
  milestoneContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  milestoneDot: {
    position: 'relative',
  },
  milestoneLeft: {
    alignItems: 'flex-start',
  },
  milestoneRight: {
    alignItems: 'flex-end',
  },
  milestoneYear: {
    fontSize: 20,
    fontWeight: '700',
    color: G.primary,
    marginBottom: 8,
  },
  milestoneContent: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: 280,
  },
  milestoneAchievement: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  milestoneFarmers: {
    fontSize: 13,
    color: G.sub,
  },
  milestoneLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: G.border,
  },
  milestoneLineLeft: {
    left: 15,
    top: 40,
    height: 60,
  },
  milestoneLineRight: {
    right: 15,
    top: 40,
    height: 60,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  goalIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: G.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  goalText: {
    fontSize: 15,
    color: G.text,
    lineHeight: 20,
    flex: 1,
  },
  ctaSection: {
    backgroundColor: G.primary,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    borderRadius: 16,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: G.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: G.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: G.white,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.primary,
  },
  ctaButtonTextSecondary: {
    color: G.white,
  },
});
