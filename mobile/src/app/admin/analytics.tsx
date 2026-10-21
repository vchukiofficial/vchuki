import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { fmtDateTime, SectionLabel, Segments, StatTile, StudioHeader } from '@/components/admin';
import { Card, ErrorState, Skeleton, T } from '@/components/ui';
import { useFetch } from '@/lib/useFetch';
import { colors, fonts, GUTTER } from '@/theme';

interface Analytics {
  totalViews: number;
  uniqueSessions: number;
  todayViews: number;
  pageBreakdown: { _id: string; views: number; avgDuration: number }[];
  deviceBreakdown: { _id: string; count: number }[];
  hourlyBreakdown: { _id: number; count: number }[];
  topReferrers: { _id: string; count: number }[];
  identifiedVisitors: { _id: string; email: string; name: string; views: number; lastSeen: string; pageCount: number }[];
}

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export default function AnalyticsScreen() {
  const [days, setDays] = useState<'1' | '7' | '30' | '90'>('7');
  const { data, loading, error, reload, refresh, refreshing } = useFetch<Analytics>(`/api/analytics?days=${days}`);
  const maxHour = Math.max(1, ...(data?.hourlyBreakdown || []).map((h) => h.count));
  const hours = Array.from({ length: 24 }, (_, h) => data?.hourlyBreakdown.find((x) => x._id === h)?.count || 0);
  const devTotal = (data?.deviceBreakdown || []).reduce((s, d) => s + d.count, 0) || 1;
  const maxPage = Math.max(1, ...(data?.pageBreakdown || []).map((p) => p.views));

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Analytics" subtitle="Website visits (vchuki.com)" />
      <View>
        <Segments
          items={[
            { key: '1', label: 'Today' },
            { key: '7', label: '7 days' },
            { key: '30', label: '30 days' },
            { key: '90', label: '90 days' },
          ]}
          value={days}
          onChange={setDays}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 60 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !data ? (
          <Skeleton style={{ height: 220 }} />
        ) : (
          <>
            <View style={st.grid}>
              <StatTile label="Page views" value={data.totalViews.toLocaleString('en-IN')} />
              <StatTile label="Visitors" value={data.uniqueSessions.toLocaleString('en-IN')} hint="unique sessions" />
              <StatTile label="Today" value={data.todayViews.toLocaleString('en-IN')} hint="page views" />
              <StatTile label="Pages / visit" value={(data.totalViews / Math.max(1, data.uniqueSessions)).toFixed(1)} />
            </View>

            <SectionLabel>Last 24 hours · IST</SectionLabel>
            <Card>
              <View style={st.bars}>
                {hours.map((c, h) => (
                  <View key={h} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ width: '70%', height: Math.max(2, (c / maxHour) * 90), backgroundColor: c ? colors.accent : colors.line, borderRadius: 2 }} />
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                {['12a', '6a', '12p', '6p', '11p'].map((l) => (
                  <T key={l} v="caption" style={{ fontSize: 10 }}>
                    {l}
                  </T>
                ))}
              </View>
            </Card>

            <SectionLabel>Devices</SectionLabel>
            <Card>
              <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                {data.deviceBreakdown.map((d, i) => (
                  <View key={d._id} style={{ flex: d.count, backgroundColor: [colors.ink, colors.accent, colors.sand][i % 3] }} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                {data.deviceBreakdown.map((d, i) => (
                  <View key={d._id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: [colors.ink, colors.accent, colors.sand][i % 3] }} />
                    <T v="caption" style={{ color: colors.ink }}>
                      {d._id} {Math.round((d.count / devTotal) * 100)}%
                    </T>
                  </View>
                ))}
              </View>
            </Card>

            <SectionLabel>Top pages</SectionLabel>
            <Card>
              {data.pageBreakdown.slice(0, 12).map((p) => (
                <View key={p._id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <T v="caption" style={{ color: colors.ink, flex: 1 }} numberOfLines={1}>
                      {p._id}
                    </T>
                    <T v="caption" style={{ fontFamily: fonts.semibold, color: colors.ink }}>
                      {p.views}
                    </T>
                  </View>
                  <View style={{ height: 4, backgroundColor: colors.sand, borderRadius: 2, marginTop: 4 }}>
                    <View style={{ height: 4, width: `${(p.views / maxPage) * 100}%`, backgroundColor: colors.accent, borderRadius: 2 }} />
                  </View>
                </View>
              ))}
            </Card>

            {data.topReferrers.length > 0 && (
              <>
                <SectionLabel>Where visitors come from</SectionLabel>
                <Card>
                  {data.topReferrers.map((r) => (
                    <View key={r._id} style={st.line}>
                      <T v="small" style={{ color: colors.ink, flex: 1 }} numberOfLines={1}>
                        {host(r._id)}
                      </T>
                      <T v="small" style={{ fontFamily: fonts.semibold, color: colors.ink }}>
                        {r.count}
                      </T>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {data.identifiedVisitors.length > 0 && (
              <>
                <SectionLabel>Signed-in visitors</SectionLabel>
                <Card>
                  {data.identifiedVisitors.slice(0, 20).map((v) => (
                    <View key={v._id} style={st.line}>
                      <View style={{ flex: 1 }}>
                        <T v="small" style={{ color: colors.ink }} numberOfLines={1}>
                          {v.name}
                        </T>
                        <T v="caption" numberOfLines={1}>
                          {v.email} · {fmtDateTime(v.lastSeen)}
                        </T>
                      </View>
                      <T v="caption">{v.views} views</T>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  bars: { flexDirection: 'row', height: 92, alignItems: 'flex-end' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
