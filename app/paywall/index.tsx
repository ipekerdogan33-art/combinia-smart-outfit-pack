import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import colors from '../../theme/colors';
import {
  getPlan,
  getRemainingFreeGenerations,
  resetGenerationCountForDebug,
  setPlan,
} from '../../lib/accessControl';
import { AppPlan } from '../../types/access';

function FeatureRow({
  label,
  freeValue,
  proValue,
}: {
  label: string;
  freeValue: string;
  proValue: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1ECE4',
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 2 }}>
        Free: {freeValue}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
        Pro: {proValue}
      </Text>
    </View>
  );
}

export default function PaywallScreen() {
  const [plan, setCurrentPlan] = useState<AppPlan>('free');
  const [remaining, setRemaining] = useState(0);

  const load = async () => {
    const currentPlan = await getPlan();
    const left = await getRemainingFreeGenerations();

    setCurrentPlan(currentPlan);
    setRemaining(Number.isFinite(left) ? left : 999);
  };

  useEffect(() => {
    load();
  }, []);

  const activatePro = async () => {
    await setPlan('pro');
    await load();
  };

  const activateFree = async () => {
    await setPlan('free');
    await resetGenerationCountForDebug();
    await load();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingTop: 80,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.5,
          marginBottom: 10,
        }}
      >
        Free / Pro
      </Text>

      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 24,
        }}
      >
        Şimdilik demo akışıyla plan yönetimini test ediyoruz.
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          Mevcut Plan: {plan === 'pro' ? 'Pro' : 'Free'}
        </Text>

        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
          {plan === 'pro'
            ? 'Sınırsız kombin üretimi aktif.'
            : `Bugün kalan ücretsiz kombin hakkın: ${remaining} / 3`}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          marginBottom: 16,
        }}
      >
        <FeatureRow label="Günlük kombin hakkı" freeValue="3" proValue="Sınırsız" />
        <FeatureRow label="Reklam arası" freeValue="Var" proValue="Yok" />
        <FeatureRow label="Alternatif üretme" freeValue="Sınırlı akış" proValue="Sınırsız akış" />
        <FeatureRow label="Gelişmiş stil motoru" freeValue="Temel" proValue="Öncelikli" />
      </View>

      <Pressable
        onPress={activatePro}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 18,
          borderRadius: 18,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          Demo Pro’yu Aç
        </Text>
      </Pressable>

      <Pressable
        onPress={activateFree}
        style={{
          backgroundColor: colors.surface,
          paddingVertical: 18,
          borderRadius: 18,
          alignItems: 'center',
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderSoft,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
          Free’ye Dön ve Sayaç Sıfırla
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={{
          backgroundColor: '#F3ECE4',
          paddingVertical: 18,
          borderRadius: 18,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
          Geri Dön
        </Text>
      </Pressable>
    </View>
  );
}
