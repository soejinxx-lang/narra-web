/* eslint-disable */
import type { Locale } from "../../lib/i18n";

// prettier-ignore
const ko = {
    title: "이용약관", effective: "시행일: 2026년 3월 1일 (v1.0)", translationNotice: "",
    footer: "이 약관은 NARRA를 이용하는 모든 분께 적용됩니다. 서비스를 이용하시면 본 약관에 동의한 것으로 봅니다.",
    a1: { title: "제1조 (목적)", body: "이 약관은 NARRA(이하 \"플랫폼\")가 운영하는 웹소설 서비스(이하 \"서비스\")를 이용함에 있어, 플랫폼과 이용자 사이의 권리·의무·책임을 정하기 위해 만들어졌습니다." },
    a2: { title: "제2조 (정의)", items: ["\"플랫폼\"이란 NARRA 웹사이트와 관련 서비스 전체를 말합니다.", "\"콘텐츠\"란 소설 원문과 번역물 등 모든 창작물을 말합니다.", "\"작가\"란 콘텐츠를 올린 회원을 말합니다.", "\"독자\"란 콘텐츠를 읽는 회원을 말합니다.", "\"회원\"이란 가입 후 서비스를 이용하는 분을 말합니다."] },
    a3: { title: "제3조 (약관의 게시 및 개정)", body: "플랫폼은 필요한 경우 이 약관을 바꿀 수 있으며, 바뀐 내용은 시행일 7일 전까지 안내해 드립니다. 바뀐 약관에 동의하지 않으시면 서비스 이용을 중단하고 탈퇴하실 수 있습니다." },
    a4: { title: "제4조 (저작권 및 권리)", s1: { title: "4.1 원작 저작권", body: "작가가 올린 원작의 저작권은 작가에게 있습니다. 다만 작가는 플랫폼에 웹사이트 게시, 9개 언어 자동 번역, 2차 저작물 제작, 홍보 목적 사용에 대한 비독점 라이선스를 부여합니다." }, s2: { title: "4.2 번역 저작권", body: "플랫폼이 만든 자동 번역의 저작권은 플랫폼에 있습니다. 번역은 AI로 생성되며 참고용입니다. 번역의 정확성이나 완전성은 보장하지 않습니다." }, s3: { title: "4.3 데이터베이스권", body: "플랫폼의 다국어 번역 데이터베이스는 저작권법 제93조에 따라 데이터베이스 제작자의 권리로 보호됩니다." } },
    a5: { title: "제5조 (AI 기술 활용)", items: ["플랫폼은 자동 번역, 추천, 검색, 서비스 개선에 AI 기술을 활용합니다.", "작가는 창작 과정에서 AI 도구를 보조적으로 사용할 수 있습니다. 다만 최종 콘텐츠에 대한 저작권과 법적 책임은 작가 본인에게 있습니다.", "일부 콘텐츠에 AI 도구가 활용되었을 수 있으며, 플랫폼은 이를 별도로 검증하지 않습니다."] },
    a6: { title: "제6조 (작가의 책임)", intro: "작가는 다음 사항을 약속합니다:", items: ["올린 콘텐츠가 본인 창작물이거나 정당한 권리를 갖고 있을 것", "타인의 저작권·상표권·초상권 등을 침해하지 않을 것", "관련 법령과 플랫폼 정책을 준수할 것", "위 약속을 어긴 경우 발생하는 모든 법적 책임은 작가가 집니다"] },
    a7: { title: "제7조 (이용 제한)", intro: "아래 행위는 금지됩니다:", items: ["콘텐츠 복제·전송·배포·출판", "번역물 무단 사용 및 재배포", "크롤링·스크래핑 등 자동화된 수집", "콘텐츠의 상업적 이용", "저작권 표시 제거·변경"], warning: "위반 시 계정 정지, 법적 조치, 손해배상 청구가 이루어질 수 있습니다." },
    a8: { title: "제8조 (면책)", items: ["작가가 올린 콘텐츠의 정확성·적법성·품질은 플랫폼이 책임지지 않습니다.", "자동 번역의 정확성이나 완전성은 보장하지 않습니다.", "시스템 점검, 천재지변, 외부 서비스 장애 등으로 서비스가 일시 중단될 수 있습니다."] },
    a9: { title: "제9조 (저작권 침해 신고)", body: "저작권 침해를 발견하신 분은 contact@narra.kr로 알려 주세요. 권리자 정보, 해당 콘텐츠 URL, 원작 정보, 증빙 자료를 함께 보내 주시면 확인 후 임시 비공개 처리하고 작가에게 안내해 드립니다." },
    a10: { title: "제10조 (서비스 요금)", items: ["현재 모든 콘텐츠는 무료로 읽을 수 있습니다.", "일부 편의 기능(구독 등)은 유료로 제공될 수 있습니다. 자세한 내용은 제12조를 확인해 주세요.", "유료 서비스의 가격이나 조건이 바뀔 때는 30일 전에 안내합니다."] },
    a11: { title: "제11조 (분쟁 해결)", items: ["이 약관은 대한민국 법에 따릅니다.", "분쟁이 생기면 먼저 대화로 해결합니다.", "합의가 어려운 경우 서울중앙지방법원에서 다룹니다."] },
    a12: { title: "제12조 (수익화 및 서비스 모델)", s1: { title: "12.1 콘텐츠 제공", body: "현재 모든 에피소드를 무료로 읽을 수 있습니다." }, s2: { title: "12.2 광고", body: "서비스 운영을 위해 에피소드 하단 등에 광고가 표시될 수 있습니다. 읽기에 방해되지 않는 위치에만 게재합니다." }, s3: { title: "12.3 유료 구독", items: ["Reader Plus: 월 $4.99 (연 $49.99)", "Author Starter: 월 $7.99 (연 $79.99)", "Author Pro: 월 $12.99 (연 $129.99)", "표시 가격은 세전 기준이며, 국가에 따라 부가세(VAT)가 붙을 수 있습니다.", "유료 구독 여부와 관계없이 모든 콘텐츠를 동일하게 이용할 수 있습니다."] }, s4: { title: "12.4 작가 외부 후원", items: ["작가는 Patreon, Ko-fi 등 외부 플랫폼으로 후원을 받을 수 있습니다.", "외부 후원 수익에 대해 플랫폼은 수수료를 받지 않습니다.", "수익 배분은 파트너 계약을 맺은 작가에 한해 별도 조건으로 제공될 수 있습니다."] }, s5: { title: "12.5 정책 변경", body: "수익화 관련 정책이 바뀔 때는 30일 전에 안내합니다." } },
    a13: { title: "제13조 (청약철회 및 환불)", items: ["결제 후 7일 이내에 구독을 취소할 수 있습니다. 다만 번역 요청이나 콘텐츠 생성 등 서비스를 이미 이용하셨다면, 전자상거래법 제17조 2항에 따라 취소가 제한될 수 있습니다.", "구독을 해지해도 결제 기간이 끝날 때까지는 계속 이용할 수 있습니다.", "연간 구독 중간 해지 시, 월 가격 기준으로 사용 기간을 계산해 나머지를 돌려드립니다.", "환불 요청은 LemonSqueezy 포털이나 contact@narra.kr에서 하실 수 있습니다.", "취소·환불 처리는 영업일 기준 최대 7일 걸릴 수 있습니다."] },
};

// prettier-ignore
const en = {
    title: "Terms of Service", effective: "Effective: March 1, 2026 (v1.0)",
    translationNotice: "This is a reference translation. The Korean original is the legally binding version.",
    footer: "These Terms apply to everyone who uses NARRA. By using the service, you agree to these Terms.",
    a1: { title: "Article 1 (Purpose)", body: "These Terms set out the rights, responsibilities, and obligations between NARRA (the \"Platform\") and its users for the web novel service (the \"Service\")." },
    a2: { title: "Article 2 (Definitions)", items: ["\"Platform\" means the NARRA website and all related services.", "\"Content\" means all creative works, including originals and translations.", "\"Author\" means a member who publishes Content.", "\"Reader\" means a member who reads Content.", "\"Member\" means anyone who has signed up and uses the Service."] },
    a3: { title: "Article 3 (Changes to Terms)", body: "We may update these Terms when needed and will give at least 7 days' notice before any changes take effect. If you disagree with the updated Terms, you can stop using the service and delete your account." },
    a4: { title: "Article 4 (Copyright)", s1: { title: "4.1 Original Works", body: "Authors own the copyright to their original works. By publishing on NARRA, Authors grant the Platform a non-exclusive license to display the work on the website, translate it into up to 9 languages, create derivative works, and use it for promotion." }, s2: { title: "4.2 Translations", body: "Auto-translated content is created by the Platform using AI and belongs to the Platform. Translations are provided for reference only — we don't guarantee their accuracy or completeness." }, s3: { title: "4.3 Database Rights", body: "Our multilingual translation database is protected under Korean Copyright Act, Article 93 (database producer rights)." } },
    a5: { title: "Article 5 (AI Technology)", items: ["We use AI for translation, recommendations, search, and improving the service.", "Authors may use AI tools to help with their creative work, but they remain responsible for the final content — both legally and in terms of copyright.", "Some content on the platform may have been created with the help of AI tools. We don't check or verify this."] },
    a6: { title: "Article 6 (Author Responsibilities)", intro: "By publishing on NARRA, Authors agree that:", items: ["Their content is original or they have the right to publish it", "It doesn't infringe anyone else's copyright, trademark, or other rights", "It follows applicable laws and our platform guidelines", "They accept full legal responsibility if any of the above isn't true"] },
    a7: { title: "Article 7 (Prohibited Actions)", intro: "You may not:", items: ["Copy, redistribute, or republish any Content", "Use or share translations without permission", "Use bots, scrapers, or automated tools to collect data", "Use Content for commercial purposes", "Remove or change copyright notices"], warning: "Breaking these rules may lead to account suspension, legal action, or damage claims." },
    a8: { title: "Article 8 (Disclaimers)", items: ["We're not responsible for the accuracy, legality, or quality of content uploaded by Authors.", "We don't guarantee that translations are accurate, complete, or up to date.", "The service may be temporarily unavailable due to maintenance, technical issues, or external service outages."] },
    a9: { title: "Article 9 (Copyright Reports)", body: "If you find content that infringes your copyright, please email contact@narra.kr with your contact details, the URL of the content, information about your original work, and evidence of the infringement. We'll temporarily hide the content and notify the Author." },
    a10: { title: "Article 10 (Pricing)", items: ["All content on NARRA is currently free to read.", "Some extra features (like subscriptions) may be offered as paid options — see Article 12 for details.", "We'll give at least 30 days' notice before changing prices or payment terms."] },
    a11: { title: "Article 11 (Disputes)", items: ["These Terms follow Korean law.", "We'll try to resolve any issues through discussion first.", "If we can't reach an agreement, the Seoul Central District Court has jurisdiction."] },
    a12: { title: "Article 12 (Business Model)", s1: { title: "12.1 Content", body: "All episodes are currently free to read." }, s2: { title: "12.2 Ads", body: "We may show ads (for example, below episodes) to keep the service running. We only place them where they won't get in the way of reading." }, s3: { title: "12.3 Subscriptions", items: ["Reader Plus: $4.99/month ($49.99/year)", "Author Starter: $7.99/month ($79.99/year)", "Author Pro: $12.99/month ($129.99/year)", "Prices are shown before tax. VAT may apply depending on where you live.", "Subscribers get the same content as free users — there's no paywalled content."] }, s4: { title: "12.4 Author Support", items: ["Authors can receive support through platforms like Patreon and Ko-fi.", "We don't take any cut from external support.", "Revenue sharing is available for Authors with partner agreements, under separate terms."] }, s5: { title: "12.5 Policy Updates", body: "We'll announce any changes to our business model at least 30 days in advance." } },
    a13: { title: "Article 13 (Cancellation & Refunds)", items: ["You can cancel within 7 days of payment. If you've already used the service (translations, content creation, etc.), cancellation may be limited under Korean e-commerce consumer protection law.", "After cancelling, you can keep using the service until your current billing period ends.", "For yearly plans cancelled early, we'll refund the remaining balance after deducting the monthly rate for the time you used.", "Request refunds through the LemonSqueezy portal or at contact@narra.kr.", "Refunds usually take up to 7 business days to process."] },
};

// prettier-ignore
const ja = { ...en, title: "利用規約", effective: "施行日：2026年3月1日（v1.0）", translationNotice: "こちらは参考訳です。法的効力を持つのは韓国語の原文となります。", footer: "この規約はNARRAをご利用のすべての方に適用されます。サービスのご利用をもって、本規約に同意いただいたものとします。",
    a1: { title: "第1条（目的）", body: "この規約は、NARRA（以下「プラットフォーム」）が運営するウェブ小説サービス（以下「サービス」）のご利用にあたり、プラットフォームと利用者の間の権利・義務・責任を定めるものです。" },
    a13: { title: "第13条（解約・返金）", items: ["決済日から7日以内であればキャンセルできます。ただし、翻訳リクエストやコンテンツ作成などサービスをすでにご利用の場合は、キャンセルが制限されることがあります。", "解約後も、お支払い済みの期間が終わるまでサービスをご利用いただけます。", "年間プランを途中解約された場合、月額換算で利用分を差し引いた残額を返金いたします。", "返金のお申し込みはLemonSqueezyポータルまたはcontact@narra.krまでご連絡ください。", "キャンセル・返金の処理には最大7営業日ほどかかる場合があります。"] },
};

// prettier-ignore
const zh = { ...en, title: "使用条款", effective: "生效日期：2026年3月1日（v1.0）", translationNotice: "本文为参考译文，具有法律效力的是韩文原版。", footer: "本条款适用于所有NARRA用户。使用本服务即表示您同意这些条款。",
    a1: { title: "第1条（目的）", body: "本条款规定了NARRA（以下简称「平台」）运营的网络小说服务（以下简称「服务」）中，平台与用户之间的权利、义务和责任。" },
    a13: { title: "第13条（取消与退款）", items: ["您可以在付款后7天内取消订阅。但如果您已经使用了翻译、内容创建等服务，取消可能会受到限制。", "取消后，您仍可继续使用服务直到当前计费期结束。", "年度订阅提前取消时，我们将按月费标准扣除已使用部分后退还剩余金额。", "退款请通过LemonSqueezy门户或发送邮件至contact@narra.kr申请。", "取消和退款处理通常需要最多7个工作日。"] },
};

// prettier-ignore
const es = { ...en, title: "Condiciones de Uso", effective: "Vigente desde: 1 de marzo de 2026 (v1.0)", translationNotice: "Esta es una traducción orientativa. El texto en coreano es la versión legalmente vinculante.", footer: "Estas condiciones se aplican a todos los usuarios de NARRA. Al usar el servicio, aceptas estas condiciones.",
    a1: { title: "Artículo 1 (Objeto)", body: "Estas condiciones establecen los derechos, obligaciones y responsabilidades entre NARRA (la \"Plataforma\") y sus usuarios en relación con el servicio de novelas web (el \"Servicio\")." },
    a13: { title: "Artículo 13 (Cancelación y reembolsos)", items: ["Puedes cancelar en los 7 días siguientes al pago. Si ya has utilizado el servicio (traducciones, creación de contenido, etc.), la cancelación podría estar limitada por la normativa de protección al consumidor.", "Tras cancelar, podrás seguir usando el servicio hasta que termine tu período de facturación.", "Si cancelas un plan anual antes de tiempo, te reembolsaremos el saldo restante descontando los meses usados al precio mensual.", "Solicita reembolsos en el portal de LemonSqueezy o escríbenos a contact@narra.kr.", "Las cancelaciones y reembolsos pueden tardar hasta 7 días hábiles."] },
};

// prettier-ignore
const fr = { ...en, title: "Conditions Générales", effective: "En vigueur : 1er mars 2026 (v1.0)", translationNotice: "Ceci est une traduction indicative. Seule la version coréenne fait foi.", footer: "Ces conditions s'appliquent à tous les utilisateurs de NARRA. En utilisant le service, vous acceptez ces conditions.",
    a1: { title: "Article 1 (Objet)", body: "Les présentes conditions définissent les droits, obligations et responsabilités entre NARRA (la « Plateforme ») et ses utilisateurs dans le cadre du service de romans web (le « Service »)." },
    a13: { title: "Article 13 (Annulation et remboursement)", items: ["Vous pouvez annuler dans les 7 jours suivant le paiement. Si vous avez déjà utilisé le service (traductions, création de contenu, etc.), l'annulation peut être limitée.", "Après annulation, le service reste accessible jusqu'à la fin de votre période de facturation.", "Pour un abonnement annuel résilié en cours de route, le remboursement est calculé en déduisant les mois utilisés au tarif mensuel.", "Demandez un remboursement sur le portail LemonSqueezy ou à contact@narra.kr.", "Le traitement des annulations et remboursements peut prendre jusqu'à 7 jours ouvrés."] },
};

// prettier-ignore
const de = { ...en, title: "Nutzungsbedingungen", effective: "Gültig ab: 1. März 2026 (v1.0)", translationNotice: "Dies ist eine unverbindliche Übersetzung. Maßgeblich ist die koreanische Originalfassung.", footer: "Diese Bedingungen gelten für alle NARRA-Nutzer. Mit der Nutzung des Dienstes stimmst du diesen Bedingungen zu.",
    a1: { title: "§ 1 (Zweck)", body: "Diese Bedingungen regeln Rechte, Pflichten und Verantwortlichkeiten zwischen NARRA (der \u201ePlattform\u201c) und den Nutzern des Webnovel-Dienstes (dem \u201eDienst\u201c)." },
    a13: { title: "§ 13 (Kündigung und Erstattung)", items: ["Du kannst innerhalb von 7 Tagen nach Zahlung kündigen. Wenn du den Dienst bereits genutzt hast (z. B. Übersetzungen, Inhaltserstellung), kann das Widerrufsrecht eingeschränkt sein.", "Nach der Kündigung kannst du den Dienst bis zum Ende deines aktuellen Abrechnungszeitraums weiter nutzen.", "Bei vorzeitiger Kündigung eines Jahresabonnements erstatten wir den Restbetrag abzüglich der genutzten Monate zum Monatspreis.", "Erstattungen beantragst du über das LemonSqueezy-Portal oder per E-Mail an contact@narra.kr.", "Kündigungen und Erstattungen werden innerhalb von 7 Werktagen bearbeitet."] },
};

// prettier-ignore
const pt = { ...en, title: "Termos de Uso", effective: "Vigente: 1 de março de 2026 (v1.0)", translationNotice: "Esta é uma tradução de referência. O texto em coreano é a versão juridicamente válida.", footer: "Estes termos valem para todos os usuários do NARRA. Ao usar o serviço, você concorda com estes termos.",
    a1: { title: "Artigo 1 (Objetivo)", body: "Estes termos definem os direitos, deveres e responsabilidades entre o NARRA (a \"Plataforma\") e seus usuários no uso do serviço de novels (o \"Serviço\")." },
    a13: { title: "Artigo 13 (Cancelamento e reembolso)", items: ["Você pode cancelar em até 7 dias após o pagamento. Se já tiver utilizado o serviço (traduções, criação de conteúdo, etc.), o cancelamento pode ser limitado.", "Após cancelar, o serviço continua disponível até o fim do período já pago.", "No cancelamento antecipado de planos anuais, reembolsamos o valor restante descontando os meses usados pelo preço mensal.", "Solicite reembolsos pelo portal LemonSqueezy ou por contact@narra.kr.", "Cancelamentos e reembolsos podem levar até 7 dias úteis."] },
};

// prettier-ignore
const id = { ...en, title: "Ketentuan Layanan", effective: "Berlaku: 1 Maret 2026 (v1.0)", translationNotice: "Ini adalah terjemahan referensi. Versi asli dalam bahasa Korea yang berlaku secara hukum.", footer: "Ketentuan ini berlaku untuk semua pengguna NARRA. Dengan menggunakan layanan ini, Anda menyetujui ketentuan ini.",
    a1: { title: "Pasal 1 (Tujuan)", body: "Ketentuan ini mengatur hak, kewajiban, dan tanggung jawab antara NARRA (\"Platform\") dan penggunanya terkait layanan novel web (\"Layanan\")." },
    a13: { title: "Pasal 13 (Pembatalan dan Pengembalian Dana)", items: ["Anda dapat membatalkan dalam 7 hari setelah pembayaran. Jika Anda sudah menggunakan layanan (terjemahan, pembuatan konten, dll.), pembatalan mungkin dibatasi.", "Setelah pembatalan, layanan tetap bisa digunakan sampai akhir periode tagihan Anda.", "Untuk langganan tahunan yang dibatalkan lebih awal, kami mengembalikan sisa saldo setelah menghitung bulan yang sudah digunakan dengan harga bulanan.", "Ajukan pengembalian dana melalui portal LemonSqueezy atau hubungi contact@narra.kr.", "Proses pembatalan dan pengembalian dana membutuhkan waktu hingga 7 hari kerja."] },
};

type TermsData = typeof ko;

const TRANSLATIONS: Record<string, TermsData> = { ko, en, ja, zh, es, fr, de, pt, id };

export function getTermsTranslations(locale: Locale): TermsData {
    return TRANSLATIONS[locale] || en;
}
