import FeetDirection from "../assets/Feet_Direction_Diagram.webp";
import ElbowFlare from "../assets/Elbow_Flare_Diagram.png";
import FeetDistance from "../assets/Feet_Distance_Diagram.png";
import KneeDistance from "../assets/Knee_Distance_Diagram.png";
import KneeDirection from "../assets/Knee_Direction_Diagram.webp";

export type Section = {
  id: string;
  title: string;
  description: string;
  content: string;
  summary: string;
  videoLink: string;
  videoDescription: string;
  diagramImage?: string;
  diagramDescription?: string;
};

export const sections: Section[] = [
  {
    id: "feet-direction",
    title: "Feet Direction",
    description: "Learn why slightly turning the feet improves alignment.",
    content: `
In a YouTube video by Coach Collin Castell (https://www.youtube.com/watch?v=XymY8gbXg90), he explains that slightly turning the feet makes it easier to keep the elbow underneath the basketball and aligned with the hoop. This supports using a small outward foot angle rather than pointing both feet perfectly straight.

According to Breakthrough Basketball (https://www.breakthroughbasketball.com/training/fight-for-feet), "Feet between 10-12 o'clock... If your toes are pointing somewhere between 10 & 12 o'clock you are in good shape." This supports measuring foot direction within a slight outward range.
`,
    summary:
      "Feet direction refers to the angle your feet point when setting up to shoot. Slightly turning both feet toward your shooting side helps align your hips, shoulders, and shooting arm with the basket. This creates a smoother, more natural shooting motion and improves accuracy. If you are a right-handed shooter your feet should be pointing at 10-12 o'clock and for left-handed shooters your feet should be pointing at 12-2 o'clock.",
    videoLink: "https://www.youtube.com/watch?v=XymY8gbXg90",
    videoDescription:
      "Watch this video to learn about what direction your feet should be facing while shooting a basketball.",
    diagramImage: FeetDirection,
    diagramDiscription:
      "What direction your feet should be facing when you shoot a basketball.",
  },
  {
    id: "elbow-flare",
    title: "Elbow Flare",
    description:
      "Learn why a small amount of elbow flare is acceptable but elbow should mostly be underneath the basketball.",
    content: `
Joe Haefner, co-founder of Breakthrough Basketball, states on https://www.breakthroughbasketball.com/qa/q1533, "Having your elbow SLIGHTLY out isn't a big deal." This supports allowing a small amount of elbow flare instead of requiring perfect alignment.

In the same YouTube video by Coach Collin Castell (https://www.youtube.com/watch?v=XymY8gbXg90), he explains that a "fly away elbow" or "chicken wing" negatively affects shooting form. This is why the program checks whether the shooter's elbow remains underneath the ball by comparing its horizontal position to the shoulder.
`,
    summary: `Elbow flare is how far your shooting elbow moves away from your body during the shot. Keeping the elbow close to your body helps the ball travel in a straight line toward the basket. Too much elbow flare can cause the shot to drift left or right and reduce consistency. You want to try keeping your elbow directly under the ball or just a little wider than that.`,
    videoLink: "https://www.youtube.com/watch?v=XymY8gbXg90",
    videoDescription:
      "Watch this video to learn how to fix your elbow flare while shooting a basketball.",
    diagramImage: ElbowFlare,
    diagramDiscription:
      "What your elbow placement should look like while you shoot a basketball.",
  },

  {
    id: "knee-bend",
    title: "Knee Bend Angle",
    description: "Learn why 125-140° of bend angle is ideal.",
    content: `
A biomechanics study from https://repository.stcloudstate.edu/cgi/viewcontent.cgi?article=1021&context=pess_etds found that "less knee flexion was associated with higher accuracy," with skilled shooters averaging approximately 133° of knee flexion during the preparation phase. This supports using a target range of approximately 125°-140°.

According to Brian McCormick, Ph.D., on https://180shooter.com/five-fake-fundamentals-in-shooting-a-basketball, shooters do not need to squat deeply before shooting but should bend enough to maintain balance and generate upward force. This further supports using a moderate knee bend instead of a deep squat.
`,
    summary: `Knee bend is the amount your knees flex before you begin your shot. Bending your knees allows you to generate power from your legs instead of relying only on your arms. This leads to better balance, smoother motion, and greater shooting range. You want to bend around (125-140)° during your shot.`,
    videoLink: "https://www.youtube.com/watch?v=45IqPcVgeVM",
    videoDescription:
      "Watch this video to learn how much you should be bending while shooting a basketball.",
    diagramImage: FeetDistance,
    diagramDiscription:
      "How bent your knees should look while shooting a basketball.",
  },

  {
    id: "feet-distance",
    title: "Feet Distance",
    description:
      "Learn why a stance with your feet a little wider than your shoulder width is part of proper form.",
    content: `
According to https://www.stpaul.gov/DocumentCenter/View2/69611.pdf, "Have your feet about shoulder width apart." This supports using shoulder width as the baseline measurement for stance.

In a YouTube video by Coach Dave Love | NBA Shooting Coach (https://www.youtube.com/watch?v=fs0h2LTaPbc), he recommends that players position their feet slightly outside the widest part of their hips. This supports giving feedback when the player's stance is slightly wider than shoulder width.
`,
    summary:
      "Feet distance is the space between your feet when setting up for a basketball shot. Keeping your feet about shoulder-width apart creates a strong, balanced base that helps you stay stable throughout your shooting motion. Proper feet distance improves balance, power transfer from your legs, and shooting consistency, making it easier to shoot accurately and maintain good form.",
    videoLink: "https://www.youtube.com/watch?v=NXWMamf8AIk&t=25s",
    videoDescription:
      "Watch this video to learn how far apart your feet should be while shooting a basketball.",
    diagramImage: FeetDistance,
    diagramDiscription:
      "How far apart your feet should be while shooting a basketball.",
  },

  {
    id: "knee-distance",
    title: "Knee Distance",
    description: "Learn why caved knees are not part of proper form.",
    content: `
According to Coury & Buehler Physical Therapy (https://cbphysicaltherapy.com/form-essential-basketball-fundamentals/), "When landing or jumping, the knees should never collapse inward." This supports detecting when the knees move inward relative to the feet.

In a YouTube video by Coach Dave Love | NBA Shooting Coach (https://www.youtube.com/watch?v=emI6Au1ZPHE), he explains that a wide, balanced base allows players to create force more efficiently, while having the legs in different positions reduces stability. This supports checking that the knees stay aligned with the feet rather than collapsing inward or flaring excessively outward.
`,
    summary: `Knee distance is the space between your knees while preparing to shoot. Keeping your knees about shoulder-width apart creates a stable base and helps maintain balance. Proper knee distance also allows for efficient power transfer from your legs to your shot.`,
    videoLink: "https://www.youtube.com/watch?v=emI6Au1ZPHE",
    videoDescription:
      "Watch this video to learn how far apart your knees should be while shooting a basketball.",
    diagramImage: KneeDistance,
    diagramDiscription:
      "How far apart your knees should be while shooting a basketball.",
  },

  {
    id: "knee-flare",
    title: "Knee Flare",
    description:
      "Learn why the knees should stay aligned with the feet rather than flaring outward.",
    content: `
Breakthrough Basketball notes that a balanced base and proper alignment help the body generate force efficiently, and that knees should remain in a stable position throughout the shot. This supports checking that the knees do not flare excessively outward during the motion.

Coach Dave Love | NBA Shooting Coach explains that keeping the knees aligned with the feet helps maintain balance and improves the ability to create force from the lower body. That makes knee flare an important part of form analysis.
`,
    summary: `Knee flare is how far your knees move outward from being directly in line with your hips. A slight outward flare keeps your knees aligned over your feet, improving balance and reducing unnecessary stress on the joints. Proper knee flare helps create a stable, controlled shooting position.`,
    videoLink: "https://www.youtube.com/watch?v=emI6Au1ZPHE",
    videoDescription:
      "Watch this video to learn where your knees should be pointing while shooting a basketball.",
    diagramImage: KneeDirection,
    diagramDiscription:
      "Ideal amount that your knees should be facing away from the basket while shooting a basketball.",
  },
  {
    id: "knee-direction",
    title: "Knee Direction",
    description:
      "Learn why your knees should be facing 10-12 o'clock (12-2 if you are a left handed shooter)",
    content: `Reddit’s r/BasketballTips discussion notes that while players are often advised to align their feet and knees directly toward the basket, many elite shooters use a slight angle, and the key is that the foot corresponding to the shooting hand should primarily face the basket. This supports using a stance setup that allows a small, natural angle while still keeping the shooting-side foot and knee aligned toward the target, rather than forcing a perfectly squared, rigid position.
    
    Breakthrough Basketball notes that a good shooting base includes feet that are “pointing straight to your target” and that “your foot, knee, elbow and ball should all be in a straight line with your shooting hand,” which supports aligning the shooting-side foot, knee, and elbow toward the basket and checking that the knees do not flare excessively outward or collapse inward during the shot.
    `,
    summary:
      "When shooting in basketball you want your knees to point mostly toward the basket, like your whole body is aimed at the target. Many coaches recommend aiming your knees around the 10–12 (12-2 for left-handed shooters) o’clock direction (straight ahead or slightly left of straight), which keeps the shooting foot, knee, and elbow in a line toward the basket. This alignment makes your shot steadier and stronger; if your knees flare out or collapse inward, the power gets scattered and you miss more shots.",
    videoLink: "https://www.youtube.com/watch?v=pCngjV2NAJg",
    videoDescription:
      "Watch this video to learn about what direction your knees should be facing while shooting a basketball.",
    diagramImage: KneeDirection,
    diagramDiscription:
      "Where your knees should be facing while shooting a basketball (opposite for left-handed shooters).",
  },
  {
    id: "pros",
    title: "Comparison to the Greats of Basketball",
    description:
      "Learn how this app tracks how close your shot is to the Greats of Basketball.",
    content: "",
    summary:
      "Basketball AI compares your shooting form to a baseline created from a video of Stephen Curry's shot. Using AI-powered pose detection, the app tracks key body landmarks throughout your shooting motion and measures important mechanics such as knee bend, elbow flare, and other form metrics. These measurements are then compared against Curry's baseline to calculate an overall similarity score. Along with the score, Basketball AI identifies specific areas where your form differs and provides targeted feedback to help you make adjustments and develop more consistent shooting mechanics.",
    videoLink: "https://www.youtube.com/watch?v=_anxl_hE9jQ",
    videoDescription:
      "This is the video I used to make the baseline for Steph Curry.",
  },
];
