/**
 * ! Executing this script will delete all data in your database and seed it with test data.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { faker } from '@snaplet/copycat';

// Import enums from Prisma schema
type AuthProvider = "Email" | "Google" | "Apple";
type UnitPreference = "Metric" | "Imperial";
type Gender = "Male" | "Female";
type UserRoutineRole = "Creator" | "Participant";
type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "AllLevels";
type TargetMuscle = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
type RoutineType = "Strength" | "Endurance" | "Flexibility" | "Balance" | "Mobility";

const main = async () => {
  const seed = await createSeedClient();

  console.log("Seeding the database...");
  
  // Truncate all tables in the database
  try {
    await seed.$resetDatabase();
  } catch (error) {
    // ignore reset errors
    console.error("Reset error:", error);
  }

  // Create test users
  console.log('Seeding users...');
  const { user } = await seed.user(x => x(8, ({ index }) => {
    if (index === 0) {
      return {
        username: "test",
        email: "test@example.com",
        authProvider: "Email" as AuthProvider,
        preferredUnits: "Metric" as UnitPreference,
        notificationsEnabled: true,
        gender: "Male" as Gender,
        age: 30,
        height: 180.5,
        weight: 75.2
      };
    } else if (index === 1) {
      return {
        username: "minimal",
        email: "minimal@example.com",
        authProvider: "Google" as AuthProvider,
        preferredUnits: "Imperial" as UnitPreference,
        notificationsEnabled: false
      };
    } else if (index === 2) {
      return {
        username: "complete",
        email: "complete@example.com",
        profilePictureUrl: "https://example.com/profile.jpg",
        authProvider: "Apple" as AuthProvider,
        authProviderId: "apple123456",
        preferredUnits: "Metric" as UnitPreference,
        notificationsEnabled: true,
        gender: "Female" as Gender,
        age: 25,
        height: 165.0,
        weight: 60.5
      };
    } else {
      return {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        authProvider: faker.helpers.arrayElement(["Email", "Google", "Apple"]) as AuthProvider,
        preferredUnits: faker.helpers.arrayElement(["Metric", "Imperial"]) as UnitPreference,
        notificationsEnabled: faker.datatype.boolean(),
        gender: faker.helpers.maybe(() => faker.helpers.arrayElement(["Male", "Female"]) as Gender),
        age: faker.helpers.maybe(() => faker.number.int({ min: 18, max: 70 })),
        height: faker.helpers.maybe(() => faker.number.float({ min: 150, max: 200 })),
        weight: faker.helpers.maybe(() => faker.number.float({ min: 45, max: 120 }))
      };
    }
  }));

  // Create exercises
  console.log('Seeding exercises...');
  const exerciseData = [
    {
      name: "Bench Press",
      targetMuscle: "Chest" as TargetMuscle,
      iconUrl: "https://example.com/icons/bench-press.svg",
      posterUrl: "https://example.com/posters/bench-press.jpg",
      instructions: [
        { 
          steps: ["Lie on bench", "Grip bar with hands slightly wider than shoulder-width", "Lower bar to chest", "Push bar up"], 
          image: "https://example.com/instructions/bench-press.jpg" 
        }
      ],
      cues: ["Keep elbows at 45 degrees", "Feet flat on floor", "Shoulders back"],
      overview: "Compound movement for chest development"
    },
    {
      name: "Squat",
      targetMuscle: "Legs" as TargetMuscle,
      iconUrl: "https://example.com/icons/squat.svg",
      posterUrl: "https://example.com/posters/squat.jpg",
      instructions: [
        { 
          steps: ["Stand with feet shoulder-width apart", "Lower hips back and down", "Keep knees in line with toes", "Return to standing"], 
          image: "https://example.com/instructions/squat.jpg" 
        }
      ],
      overview: "Primary lower body compound exercise"
    },
    {
      name: "Pull-Up",
      targetMuscle: "Back" as TargetMuscle,
      iconUrl: "https://example.com/icons/pull-up.svg",
      posterUrl: "https://example.com/posters/pull-up.jpg"
    }
  ];

  const { exercise } = await seed.exercise(x => x(10, ({ index }) => {
    if (index < exerciseData.length) {
      return exerciseData[index];
    } else {
      return {
        name: faker.word.noun(),
        targetMuscle: faker.helpers.arrayElement(["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]) as TargetMuscle,
        iconUrl: `https://example.com/icons/${faker.word.noun()}.svg`,
        posterUrl: `https://example.com/posters/${faker.word.noun()}.jpg`,
        instructions: faker.helpers.maybe(() => [
          {
            steps: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
            image: `https://example.com/instructions/${faker.word.noun()}.jpg`
          }
        ]),
        cues: faker.helpers.maybe(() => [faker.lorem.sentence(), faker.lorem.sentence()]),
        overview: faker.helpers.maybe(() => faker.lorem.paragraph())
      };
    }
  }));

  // Create routines
  console.log('Seeding routines...');
  const routineData = [
    {
      name: "Beginner Strength",
      type: "Strength" as RoutineType,
      skillLevel: "Beginner" as SkillLevel
    },
    {
      name: "Core Mobility",
      type: "Mobility" as RoutineType,
      skillLevel: "Intermediate" as SkillLevel
    },
    {
      name: "Advanced Flexibility",
      type: "Flexibility" as RoutineType,
      skillLevel: "Advanced" as SkillLevel
    },
    {
      name: "All Levels Balance",
      type: "Balance" as RoutineType,
      skillLevel: "AllLevels" as SkillLevel
    }
  ];

  const { routine } = await seed.routine(x => x(routineData.length + 3, ({ index }) => {
    if (index < routineData.length) {
      return routineData[index];
    } else {
      return {
        name: faker.lorem.words(2),
        type: faker.helpers.arrayElement(["Strength", "Endurance", "Flexibility", "Balance", "Mobility"]) as RoutineType,
        skillLevel: faker.helpers.arrayElement(["Beginner", "Intermediate", "Advanced", "AllLevels"]) as SkillLevel
      };
    }
  }));

  // Create user-routine connections
  console.log('Seeding user-routines...');
  await seed.userRoutine(x => x(10, ({ index }) => {
    // First 5 mappings are specific, rest are random
    if (index === 0) {
      return {
        userId: user[0].id, // test user
        routineId: routine[0].id, // Beginner Strength
        role: "Creator" as UserRoutineRole
      };
    } else if (index === 1) {
      return {
        userId: user[0].id, // test user
        routineId: routine[1].id, // Core Mobility
        role: "Participant" as UserRoutineRole
      };
    } else if (index === 2) {
      return {
        userId: user[1].id, // minimal user
        routineId: routine[2].id, // Advanced Flexibility
        role: "Creator" as UserRoutineRole
      };
    } else if (index === 3) {
      return {
        userId: user[2].id, // complete user
        routineId: routine[0].id, // Beginner Strength
        role: "Participant" as UserRoutineRole
      };
    } else if (index === 4) {
      return {
        userId: user[2].id, // complete user
        routineId: routine[3].id, // All Levels Balance
        role: "Creator" as UserRoutineRole
      };
    } else {
      // Random mappings
      return {
        userId: user[faker.number.int({ min: 0, max: user.length - 1 })].id,
        routineId: routine[faker.number.int({ min: 0, max: routine.length - 1 })].id,
        role: faker.helpers.arrayElement(["Creator", "Participant"]) as UserRoutineRole
      };
    }
  }));

  // Create routine-exercise connections
  console.log('Seeding routine-exercises...');
  const routineExerciseData = [
    {
      routineId: routine[0].id, // Beginner Strength
      exerciseId: exercise[0].id, // Bench Press
      notes: "Focus on form, not weight",
      sets: [
        { reps: 10, weight: 135 },
        { reps: 8, weight: 155 },
        { reps: 6, weight: 175 }
      ],
      restTime: 90,
      order: 1,
      rir: 2
    },
    {
      routineId: routine[0].id, // Beginner Strength
      exerciseId: exercise[1].id, // Squat
      sets: [
        { reps: 12, rpe: 7 },
        { reps: 12, rpe: 7 }
      ],
      order: 2
    },
    {
      routineId: routine[1].id, // Core Mobility
      exerciseId: exercise[2].id, // Pull-Up
      sets: [
        { reps: 5 },
        { reps: 5 }
      ],
      restTime: 120,
      order: 1
    }
  ];

  await seed.routineExercise(x => x(routineExerciseData.length + 12, ({ index }) => {
    if (index < routineExerciseData.length) {
      return routineExerciseData[index];
    } else {
      // Create random routine-exercise mappings
      const routineIndex = faker.number.int({ min: 0, max: routine.length - 1 });
      const exerciseIndex = faker.number.int({ min: 0, max: exercise.length - 1 });
      const order = index - routineExerciseData.length + 1;
      
      return {
        routineId: routine[routineIndex].id,
        exerciseId: exercise[exerciseIndex].id,
        sets: [{ reps: faker.number.int({ min: 5, max: 15 }) }],
        order: order % 5 + 1, // Order 1-5 for each routine
        restTime: faker.helpers.maybe(() => faker.number.int({ min: 30, max: 120 })),
        rir: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 4 })),
        notes: faker.helpers.maybe(() => faker.lorem.sentence())
      };
    }
  }));

  console.log("Database seeded successfully!");

  process.exit();
};

main();