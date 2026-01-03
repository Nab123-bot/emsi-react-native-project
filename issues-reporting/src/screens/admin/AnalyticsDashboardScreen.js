import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { FirebaseService } from '../../services/firebaseService';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen = ({ onNavPress }) => {
    const [data, setData] = useState({
        totalIncidents: 0,
        resolutionRate: 0,
        avgResponse: '...',
        activeUsers: 0,
        categoryData: [],
        topContributors: [],
        trends: [0, 0, 0, 0, 0, 0, 0]
    });

    useEffect(() => {
        const unsubscribe = FirebaseService.subscribeToAnalytics(
            (stats) => {
                setData(stats);
            },
            (error) => console.error("Analytics Error:", error)
        );
        return () => unsubscribe();
    }, []);

    const CategoryProgress = ({ label, count, percentage, color }) => (
        <View style={styles.catProgressItem}>
            <View style={styles.catHeader}>
                <View style={styles.catLabelRow}>
                    <View style={[styles.catDot, { backgroundColor: color }]} />
                    <Text style={styles.catLabel}>{label}</Text>
                </View>
                <Text style={styles.catCount}>{count}</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    // Simple smooth curve generator could go here, or just use Line from chart lib.
    // For this custom SVG implementation matching the HTML look:
    // We'll scale the points to the SVG viewbox.
    const Chart = ({ dataPoints }) => {
        const height = 100;
        const w = width - 64; // padding
        const max = Math.max(...dataPoints, 1);
        const points = dataPoints.map((val, i) => {
            const x = (i / (dataPoints.length - 1)) * w;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        });

        // Simple smoothing (Bezier) would be better, but straight lines for MVP or simple curve logic
        // Let's just do a polyline for now or a basic curve if possible.
        const d = `M0,${height} ` + points.map(p => `L${p}`).join(' ') + ` L${w},${height} Z`; // Closed path for gradient
        const linePath = `M` + points.join(' L'); // Open path for stroke

        return (
            <View style={styles.chartContainer}>
                <Svg height={height} width={w} style={{ overflow: 'visible' }}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.3" />
                            <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    {/* Fill */}
                    {/* <Path d={d} fill="url(#grad)" /> Only works if points logic is closed correctly */}

                    {/* Stroke */}
                    <Path d={linePath} stroke={theme.colors.primary} strokeWidth="3" fill="none" />
                </Svg>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Analytics</Text>
                <View style={styles.periodBadge}>
                    <MaterialIcons name="calendar-today" size={12} color="#9db9a6" />
                    <Text style={styles.periodText}>Last 30 Days</Text>
                    <MaterialIcons name="arrow-drop-down" size={16} color="#9db9a6" />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <View style={styles.kpiHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <MaterialIcons name="assignment" size={18} color="#60a5fa" />
                            </View>
                            <Text style={styles.kpiLabel}>Total Incidents</Text>
                        </View>
                        <Text style={styles.kpiValue}>{data.totalIncidents}</Text>
                        <View style={styles.trendRow}>
                            <MaterialIcons name="trending-up" size={14} color={theme.colors.primary} />
                            <Text style={styles.trendText}>+12%</Text>
                        </View>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(19, 236, 91, 0.2)' }]}>
                                <MaterialIcons name="check-circle" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.kpiLabel}>Resolution Rate</Text>
                        </View>
                        <Text style={styles.kpiValue}>{data.resolutionRate}%</Text>
                        <View style={styles.trendRow}>
                            <MaterialIcons name="trending-up" size={14} color={theme.colors.primary} />
                            <Text style={styles.trendText}>+5%</Text>
                        </View>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                                <MaterialIcons name="timer" size={18} color="#fb923c" />
                            </View>
                            <Text style={styles.kpiLabel}>Avg. Response</Text>
                        </View>
                        <Text style={styles.kpiValue}>{data.avgResponse}</Text>
                        <View style={styles.trendRow}>
                            <MaterialIcons name="trending-down" size={14} color="#ef4444" />
                            <Text style={[styles.trendText, { color: '#ef4444' }]}>-10%</Text>
                        </View>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                                <MaterialIcons name="group" size={18} color="#c084fc" />
                            </View>
                            <Text style={styles.kpiLabel}>Active Users</Text>
                        </View>
                        <Text style={styles.kpiValue}>{data.activeUsers}</Text>
                        <View style={styles.trendRow}>
                            <MaterialIcons name="trending-up" size={14} color={theme.colors.primary} />
                            <Text style={styles.trendText}>+2%</Text>
                        </View>
                    </View>
                </View>

                {/* Trends Chart */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Incident Trends</Text>
                            <Text style={styles.sectionSubtitle}>Weekly Volume</Text>
                        </View>
                        <View style={styles.trendBadge}>
                            <MaterialIcons name="trending-up" size={14} color={theme.colors.primary} />
                            <Text style={styles.trendBadgeText}>+8%</Text>
                        </View>
                    </View>
                    <Chart dataPoints={data.trends} />
                    <View style={styles.xAxis}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <Text key={day} style={styles.xLabel}>{day}</Text>
                        ))}
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Incidents by Category</Text>
                    </View>
                    <View style={styles.catList}>
                        {data.categoryData.length > 0 ? (
                            data.categoryData.map((cat, i) => {
                                const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#a855f7'];
                                return (
                                    <CategoryProgress
                                        key={cat.label}
                                        label={cat.label}
                                        count={cat.count}
                                        percentage={cat.percentage}
                                        color={colors[i % colors.length]}
                                    />
                                );
                            })
                        ) : (
                            <Text style={styles.emptyText}>No data available</Text>
                        )}
                    </View>
                </View>

                {/* Top Contributors */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Contributors</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {data.topContributors.map((user, index) => (
                        <View key={user.id} style={styles.userRow}>
                            <View style={styles.userAvatar}>
                                {user.avatar ?
                                    <Image source={{ uri: user.avatar }} style={styles.avatarImg} /> :
                                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{user.name[0]}</Text></View>
                                }
                                {index === 0 && (
                                    <View style={styles.rankBadge}>
                                        <MaterialIcons name="star" size={10} color="#f59e0b" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userStats}>{user.count} resolutions</Text>
                            </View>
                            <View style={styles.efficiencyBadge}>
                                <Text style={styles.efficiencyText}>{user.efficiency}</Text>
                            </View>
                        </View>
                    ))}
                    {data.topContributors.length === 0 && <Text style={styles.emptyText}>No contributors yet</Text>}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavPress('admin-user-management')}>
                    <MaterialIcons name="group" size={24} color="#6b7280" />
                    <Text style={styles.navText}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavPress('admin-categories')}>
                    <MaterialIcons name="category" size={24} color="#6b7280" />
                    <Text style={styles.navText}>Categories</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavPress('admin-analytics')}>
                    <View style={styles.activeNavIcon}>
                        <MaterialIcons name="bar-chart" size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.activeNavText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavPress('admin-roles-permissions')}>
                    <MaterialIcons name="settings" size={24} color="#6b7280" />
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#102216',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 12,
        paddingBottom: 16,
        backgroundColor: 'rgba(16, 34, 22, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c2e24',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    periodText: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    kpiCard: {
        width: (width - 44) / 2, // 2 columns, padding calculations
        backgroundColor: '#1c2e24',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kpiLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    sectionCard: {
        backgroundColor: '#1c2e24',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 2,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(19, 236, 91, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    trendBadgeText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    chartContainer: {
        marginVertical: 12,
        alignItems: 'center',
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    xLabel: {
        color: '#6b7280',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    catList: {
        gap: 16,
    },
    catProgressItem: {
        gap: 6,
    },
    catHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    catDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    catLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    catCount: {
        color: '#9ca3af',
        fontSize: 12,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    viewAllText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    userAvatar: {
        position: 'relative',
        width: 40,
        height: 40,
    },
    avatarImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#1c2e24',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1c2e24',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    userStats: {
        color: '#9ca3af',
        fontSize: 12,
    },
    efficiencyBadge: {
        backgroundColor: 'rgba(19, 236, 91, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    efficiencyText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 8,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#0d1c12',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingBottom: 20,
        zIndex: 30,
    },
    navItem: {
        alignItems: 'center',
        width: 64,
        gap: 4,
    },
    activeNavIcon: {
        width: 48,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(19, 236, 91, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeNavText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6b7280',
    },
});

export default AnalyticsDashboardScreen;
