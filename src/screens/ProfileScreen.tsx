import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  getProfileSettings,
  updateProfileSettings,
  changePassword,
  type ProfileSettings,
} from "../services/profile.service";
import { extractApiError } from "../utils/errorHandling";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  FARMER: "#1A7A35",
  MERCHANT: "#1565C0",
  DELIVERY: "#00695C",
  ADMIN: "#6A1B9A",
  MANAGER: "#6A1B9A",
  AGENT: "#6A1B9A",
};

const ROLE_LABELS: Record<string, string> = {
  FARMER: "Farmer",
  MERCHANT: "Merchant",
  DELIVERY: "Delivery Agent",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  AGENT: "Agent",
};

const ROLE_EMOJI: Record<string, string> = {
  FARMER: "🌾",
  MERCHANT: "🛒",
  DELIVERY: "🚚",
  ADMIN: "🛠️",
  MANAGER: "📋",
  AGENT: "👤",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // ── Profile data state ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Change password state ───────────────────────────────────────────────────
  const [pwExpanded, setPwExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  // ── Derived display values ──────────────────────────────────────────────────
  const displayedName =
    profile?.display_name ?? profile?.name ?? user?.name ?? "User";
  const role = profile?.role ?? user?.role ?? "";
  const roleColor = ROLE_COLORS[role] ?? "#424242";
  const roleLabel = ROLE_LABELS[role] ?? role ?? "User";
  const roleEmoji = ROLE_EMOJI[role] ?? "👤";

  const initials =
    displayedName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // ── Load profile on mount ───────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setLoadError(null);
    try {
      const data = await getProfileSettings();
      setProfile(data);
    } catch (err) {
      const { message } = extractApiError(err);
      setLoadError(message);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Edit handlers ───────────────────────────────────────────────────────────
  const startEdit = useCallback(() => {
    setDisplayName(profile?.display_name ?? "");
    setUsername(profile?.username ?? "");
    setBio(profile?.bio ?? "");
    setSaveError(null);
    setEditing(true);
  }, [profile]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setSaveError(null);
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const prevProfile = profile;
    try {
      const updated = await updateProfileSettings({
        display_name: displayName.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      const { message } = extractApiError(err);
      setSaveError(message);
      setProfile(prevProfile);
    } finally {
      setSaving(false);
    }
  }

  // ── Change password handler ─────────────────────────────────────────────────
  async function handleChangePassword() {
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword) {
      setPwError("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setChangingPw(true);
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPwSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const { message } = extractApiError(err);
      setPwError(message);
    } finally {
      setChangingPw(false);
    }
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A7A35" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero ── */}
          <View style={[styles.hero, { backgroundColor: roleColor }]}>
            <View style={styles.avatarWrap}>
              <Text style={[styles.avatarText, { color: roleColor }]}>
                {initials}
              </Text>
            </View>
            <Text style={styles.heroName}>{displayedName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {roleEmoji} {roleLabel}
              </Text>
            </View>
            {user?.system_user_id && (
              <Text style={styles.heroId}>{user.system_user_id}</Text>
            )}
          </View>

          {/* ── View mode ── */}
          {!editing && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Account Info</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={startEdit}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                </View>
                <InfoRow
                  icon="👤"
                  label="Display Name"
                  value={profile?.display_name ?? profile?.name ?? "—"}
                />
                {profile?.username ? (
                  <InfoRow
                    icon="🔖"
                    label="Username"
                    value={`@${profile.username}`}
                  />
                ) : null}
                {profile?.bio ? (
                  <InfoRow icon="📝" label="Bio" value={profile.bio} />
                ) : null}
                <InfoRow
                  icon="✉️"
                  label="Email"
                  value={
                    profile?.email
                      ? `${profile.email}${profile.email_verified ? " ✓" : ""}`
                      : "—"
                  }
                />
                {profile?.phone ? (
                  <InfoRow
                    icon="📱"
                    label="Phone"
                    value={`${profile.phone}${profile.phone_verified ? " ✓" : ""}`}
                  />
                ) : null}
                <InfoRow icon="🏷️" label="Role" value={roleLabel} />
                {user?.system_user_id && (
                  <InfoRow
                    icon="🆔"
                    label="User ID"
                    value={user.system_user_id}
                  />
                )}
              </View>

              {/* ── Change Password (collapsible) ── */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => {
                    setPwExpanded((v) => !v);
                    setPwError(null);
                    setPwSuccess(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.sectionTitle}>Change Password</Text>
                  <Text style={styles.chevron}>
                    {pwExpanded ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {pwExpanded && (
                  <View style={styles.pwForm}>
                    <View style={styles.fieldWrap}>
                      <Text style={styles.fieldLabel}>Current Password</Text>
                      <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={(t) => {
                          setCurrentPassword(t);
                          setPwError(null);
                        }}
                        placeholder="Enter current password"
                        placeholderTextColor="#BDBDBD"
                        secureTextEntry
                        editable={!changingPw}
                      />
                    </View>
                    <View style={styles.fieldWrap}>
                      <Text style={styles.fieldLabel}>New Password</Text>
                      <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={(t) => {
                          setNewPassword(t);
                          setPwError(null);
                        }}
                        placeholder="At least 8 characters"
                        placeholderTextColor="#BDBDBD"
                        secureTextEntry
                        editable={!changingPw}
                      />
                    </View>
                    <View style={styles.fieldWrap}>
                      <Text style={styles.fieldLabel}>Confirm New Password</Text>
                      <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={(t) => {
                          setConfirmPassword(t);
                          setPwError(null);
                        }}
                        placeholder="Repeat new password"
                        placeholderTextColor="#BDBDBD"
                        secureTextEntry
                        editable={!changingPw}
                      />
                    </View>

                    {pwError ? (
                      <Text style={styles.fieldError}>{pwError}</Text>
                    ) : null}
                    {pwSuccess ? (
                      <Text style={styles.successText}>{pwSuccess}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        changingPw && styles.saveBtnDisabled,
                      ]}
                      onPress={handleChangePassword}
                      disabled={changingPw}
                      activeOpacity={0.85}
                    >
                      {changingPw ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.saveBtnText}>Update Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <ActionRow
                  icon="🚪"
                  label="Sign Out"
                  danger
                  onPress={handleLogout}
                />
              </View>
            </>
          )}

          {/* ── Edit mode ── */}
          {editing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={(t) => {
                    setDisplayName(t);
                    setSaveError(null);
                  }}
                  placeholder="Your display name"
                  placeholderTextColor="#BDBDBD"
                  editable={!saving}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(t) => {
                    setUsername(t);
                    setSaveError(null);
                  }}
                  placeholder="e.g. johnmwangi"
                  placeholderTextColor="#BDBDBD"
                  editable={!saving}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={(t) => {
                    setBio(t);
                    setSaveError(null);
                  }}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#BDBDBD"
                  editable={!saving}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Read-only fields */}
              <InfoRow
                icon="✉️"
                label="Email"
                value={profile?.email ?? "—"}
              />
              <InfoRow
                icon="📱"
                label="Phone"
                value={profile?.phone ?? "—"}
              />
              <Text style={styles.readOnlyNote}>
                Email and phone changes require OTP verification.
              </Text>

              {saveError ? (
                <Text style={styles.fieldError}>{saveError}</Text>
              ) : null}

              {/* Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={cancelEdit}
                  disabled={saving}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>
        {label}
      </Text>
      <Text style={styles.actionChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F9F7" },

  // Centered states (loading / error)
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#757575" },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: "#1A7A35",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarText: { fontSize: 30, fontWeight: "800" },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 6,
  },
  roleBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  heroId: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },

  // Section
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  chevron: { fontSize: 14, color: "#9E9E9E", paddingTop: 14 },
  editBtn: {
    backgroundColor: "#F0FBF3",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  editBtnText: { fontSize: 13, color: "#1A7A35", fontWeight: "700" },

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  infoIcon: { fontSize: 16, marginRight: 10, width: 24, textAlign: "center" },
  infoLabel: { fontSize: 14, color: "#757575", fontWeight: "500", flex: 1 },
  infoValue: {
    fontSize: 14,
    color: "#0D1B0F",
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },

  // Action row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  actionIcon: { fontSize: 18, marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 15, color: "#0D1B0F", fontWeight: "600" },
  actionLabelDanger: { color: "#B71C1C" },
  actionChevron: { fontSize: 20, color: "#BDBDBD" },

  // Edit form
  pwForm: { paddingBottom: 16 },
  fieldWrap: { marginBottom: 4, paddingTop: 10 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7F9F7",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 15,
    color: "#0D1B0F",
    fontWeight: "500",
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  fieldError: {
    fontSize: 12,
    color: "#B71C1C",
    marginTop: 4,
    fontWeight: "500",
    paddingBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: "#1A7A35",
    marginTop: 4,
    fontWeight: "600",
    paddingBottom: 8,
  },
  readOnlyNote: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 6,
    marginBottom: 4,
    fontStyle: "italic",
  },

  editActions: { paddingVertical: 16, gap: 10 },
  saveBtn: {
    backgroundColor: "#1A7A35",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#1A7A35",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#A5D6A7",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { color: "#757575", fontSize: 15, fontWeight: "600" },
});
