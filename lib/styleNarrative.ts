import { OnboardingData } from '../types/onboarding';
import { OutfitRecommendation } from '../types/outfit';
import { SavedLook } from './savedLooksStorage';

type NarrativeLook = OutfitRecommendation | SavedLook;

function n(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

function getPieces(look: NarrativeLook) {
  return Object.values(look.pieces || {}).filter(Boolean) as any[];
}

function buildOccasionOpening(look: NarrativeLook) {
  if (look.occasion === 'Ofis') {
    return 'Bu görünüm ofis günü için düzenli, sakin ve güven veren bir duruş kuruyor.';
  }

  if (look.occasion === 'Davet') {
    return 'Bu görünüm davet tarafında daha özenli ve dikkat çekici bir his veriyor.';
  }

  if (look.occasion === 'Spor') {
    return 'Bu görünüm hareket kolaylığı ve konforu öne çıkaran net bir spor dili kuruyor.';
  }

  if (look.occasion === 'Seyahat') {
    return 'Bu görünüm seyahat için pratik, tekrar kullanılabilir ve yorucu olmayan bir akış sunuyor.';
  }

  return 'Bu görünüm günlük kullanımda rahat ama derli toplu bir enerji taşıyor.';
}

function buildColorSentence(look: NarrativeLook) {
  const colors = [...new Set(getPieces(look).map((item) => item.color).filter(Boolean))] as string[];
  if (!colors.length) return '';

  if (colors.length === 1) {
    return `${colors[0]} tonu görünümü daha net ve sade tutuyor.`;
  }

  if (colors.length === 2) {
    return `${colors[0]} ve ${colors[1]} dengesi görünümün daha kontrollü ve kolay giyilebilir hissetmesini sağlıyor.`;
  }

  return `${colors.slice(0, 3).join(', ')} tonları görünümde katmanlı ama hâlâ dengeli bir etki oluşturuyor.`;
}

function buildSilhouetteSentence(look: NarrativeLook) {
  const pieces = getPieces(look);
  const fits = pieces.map((item) => n(item.fit)).filter(Boolean);
  const categories = pieces.map((item) => item.category);

  if (categories.includes('Elbise') || categories.includes('Takım')) {
    return 'Tek parça ya da takım etkisi silueti daha güçlü ve kararlı gösteriyor.';
  }

  if (fits.some((fit) => fit.includes('oversize')) && fits.some((fit) => fit.includes('structured'))) {
    return 'Daha rahat bir parça ile daha düzenli bir formu eşleştirmek görünümde iyi bir oran kuruyor.';
  }

  if (fits.some((fit) => fit.includes('oversize')) || fits.some((fit) => fit.includes('relaxed'))) {
    return 'Rahat fit dili görünümü zorlamadan modernleştiriyor.';
  }

  if (fits.some((fit) => fit.includes('slim')) || fits.some((fit) => fit.includes('structured'))) {
    return 'Daha net ve toparlanmış bir siluet görünümü daha rafine hale getiriyor.';
  }

  return 'Parçaların oranı görünümün kolay ve dengeli akmasını sağlıyor.';
}

function buildProfileSentence(profile: OnboardingData, look: NarrativeLook) {
  const styles = profile.styles || [];

  if (styles.includes('Minimalist')) {
    return 'Minimalist yönün için fazla dağılmadan temiz bir bütünlük kurulmuş durumda.';
  }

  if (styles.includes('Klasik')) {
    return 'Klasik stil tarafın için güvenli ama sıkıcı olmayan bir denge kuruluyor.';
  }

  if (styles.includes('Davet') && look.occasion === 'Davet') {
    return 'Davet yönünle uyumlu şekilde görünüm biraz daha dikkatli ve özenli ilerliyor.';
  }

  if (styles.includes('Günlük / Casual') && look.occasion === 'Günlük') {
    return 'Casual tarafını korurken dağınık görünmeden kalmayı başarıyor.';
  }

  if (styles.includes('Spor Şık')) {
    return 'Spor-şık yönün için rahatlık ve düzen hissi aynı anda korunuyor.';
  }

  return '';
}

function buildWeatherSentence(look: NarrativeLook) {
  if (look.weatherBand === '0-10' || look.weatherBand === '10-15') {
    return 'Serin hava için görünümde yeterli koruma hissi var.';
  }

  if (look.weatherBand === '25+') {
    return 'Daha sıcak hava düşünülerek görünümün ağırlığı hafif tutulmuş.';
  }

  if (look.precipitation === 'Yağışlı') {
    return 'Yağış ihtimali için görünüm fazla kırılgan bırakılmamış.';
  }

  return '';
}

export function buildStyleNarrative(
  look: NarrativeLook,
  profile: OnboardingData
) {
  return [
    buildOccasionOpening(look),
    buildColorSentence(look),
    buildSilhouetteSentence(look),
    buildProfileSentence(profile, look),
    buildWeatherSentence(look),
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join(' ');
}
