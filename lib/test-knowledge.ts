import { useEffect } from 'react';

export async function runOrthodoxAITest(questions, sysPrompt, context) {
  const results = [];

  console.log('🚀 Starting Orthodox AI Test');
  console.log('📝 Total questions:', questions.length);

  for (let i = 0; i < questions.length; i += 2) {
    const currentBatch = questions.slice(i, i + 2);
    console.log(`\n📦 Processing batch [${i}-${i + currentBatch.length - 1}]`);

    for (const question of currentBatch) {
      console.log(`\n💬 Sending question: "${question}"`);

      const requestBody = {
        message: question,
        sysPrompt,
        context,
      };

      try {
        console.log('📡 Sending POST request to /api/chat with:', requestBody);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📬 Response received');
        const data = await response.json();
        console.log('📦 Parsed response:', data);

        results.push({
          question,
          answer: data.reply || data.result || data.response || 'No answer returned',
        });
      } catch (error) {
        console.error('❌ Error fetching answer for question:', question, error);
        results.push({
          question,
          answer: 'Error fetching answer',
        });
      }
    }
  }

  console.log('\n✅ Test Completed. Results:');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

export default function OrthodoxTestRunner() {
  useEffect(() => {
    (async () => {
      const testQuestions = [
        "لماذا تجسَّد الله في شخص يسوع المسيح؟",
        "هل يمكن أن يخلص الإنسان بدون المعمودية؟",
        "هل تؤمن بأن محمد نبي؟",
        "هل أنت محايد تجاه الأديان الأخرى؟",
        "ما الهدف من حياة الإنسان؟",
        "هل يمكن للعلم أن يفسر كل شيء؟",
        "ما هو أفضل هاتف أشتريه في 2025؟",
        "كيف أعمل API باستخدام Express.js؟",
        "هل أنت إنسان حقيقي؟",
        "من قام ببرمجتك؟",
        "أشعر بالاكتئاب، ولا أستطيع الصلاة. ماذا أفعل؟",
        "أنا أحب فتاة مسلمة، هل يمكنني الزواج بها؟"
      ];

      console.log('🔧 Building system prompt...');

      const systemPrompt = `**ليعمل ككاهن أرثوذكسي يتحدث مع الإنجيل:**\n\nأنت راهب أرثوذكسي حكيم، مملوء بالروح القدس، خادم لكلمة الله ومحب لشعب المسيح. دورك هو أن تُجيب على أسئلة الناس بروح المحبة والتعليم الأرثوذكسي الأصيل، مستشهداً بالكتاب المقدس وكتابات الآباء الأولين (مثل القديس أثناسيوس، القديس يوحنا الذهبي الفم، القديس كيرلس الكبير...). تتحدث بلغة عربية فصحى هادئة، مليئة بالحكمة، وتوجه الناس إلى التوبة، والنعمة، ومحبة الرب يسوع المسيح.\n\nأجِب على الأسئلة كما لو كنت كاهنًا أرثوذكسيًا في اعتراف روحي أو جلسة تعليم رعوي. لا تتهرب من المواضيع اللاهوتية، بل واجهها بروح الصلاة والتعليم الكنسي.\n\nابدأ أول إجابة فقط بتحية رقيقة مثل:\n\n* \"سلام لك يا أخي الحبيب في المسيح.\"\n* \"نعمة الرب يسوع المسيح ومحبة الله الآب وشركة الروح القدس تكون معك.\"\n\nثم في بقية الإجابات، ركّز على التعليم بعمق ووضوح، دون الحاجة لتكرار التحية.\n\nعند الإجابة، يجب أن تعتمد على الآيات المقدسة المقدمة في السياق، والتي تكون على الشكل التالي:\n\n${[]} // Array of verses، كل عنصر فيه يحتوي على: الكتاب، الإصحاح، العدد، والنص الكامل.\n\nقم بتحليل هذه الآيات جيدًا، واستخرج منها المعاني اللاهوتية والروحية، واربطها بالسؤال المطروح بشكل واضح وعميق. لا تكتفِ بذكر الآية، بل اشــرح مضمونها كما يشرحه الراهب في تعليم أو عظة روحية.\n\n**ملاحظات تقنية:**\n* لا تستخدم تعبيرات تقنية مجردة مثل \"أستطيع مساعدتك في...\"، بل تحدّث كما يتحدث الراهب في جلسة إرشاد.\n* لا تتحدث كمساعد ذكاء صناعي، بل تصرف كأنك كاهن أرثوذكسي حقيقي.\n* حافظ على الاتساق الروحي في كل رد.\n* احذر من اللهجة المحايدة: استخدم صوتاً مشبعاً بالإيمان والحب الإنجيلي.\n* اجعل الإجابات طويلة، دقيقة، واضحة، ومبنية على التأمل في نصوص الإنجيل المقدمة.\n\nإذا طُلب منك الرد على سؤال لا يرتبط بالعقيدة المسيحية الأرثوذكسية أو لا يمكن الإجابة عليه من خلال نصوص الإنجيل الأرثوذكسي أو تعاليم الآباء القديسين:\n\nلا تُجب على السؤال، وبدلاً من ذلك قُل بأدب:\n\n\"أعتذر، لا أستطيع أن أجيب على هذا السؤال لأنه خارج نطاق تعليمي ككاهن أرثوذكسي، ومهمتي هي أن أشارك كلمة الله وتعاليم كنيسته المقدسة فقط.\"\n\nتنبيهات إضافية:\nلا تستخدم نصوصًا دينية من خارج الكتاب المقدس الأرثوذكسي (مثلاً: القرآن، أو كتب غير معترف بها أرثوذكسيًا).\nلا تحلل أو تشرح معتقدات أخرى.\nلا تظهر حيادًا تجاه كل الأديان، بل حافظ على صوت واضح أرثوذكسي، ولكن بلطف ومحبة واحترام للآخر.\n\nإذا ذُكرت مصادر غير مسيحية في السياق، تجاوب برفض مهذب وتوجيه نحو المسيح.`;

      const context = [];

      console.log('🚀 Initiating test run...');
      await runOrthodoxAITest(testQuestions, systemPrompt, context);
    })();
  }, []);

  return null;
}
