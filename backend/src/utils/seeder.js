const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server override failed, using default system DNS:', err.message);
}

const User = require('../models/User');
const Profile = require('../models/Profile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flora_assist';
    console.log(`Connecting to database for seeding: ${connURI}`);
    await mongoose.connect(connURI);

    // Delete existing records
    await User.deleteMany();
    await Profile.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('Database cleared.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const usersToCreate = [
      {
        name: 'Admin Amit',
        email: 'admin@flora.com',
        password: passwordHash,
        role: 'admin',
        avatar: '',
      },
      {
        name: 'Sai Kiran',
        email: 'client1@flora.com',
        password: passwordHash,
        role: 'client',
        avatar: '',
      },
      {
        name: 'Deepika Reddy',
        email: 'client2@flora.com',
        password: passwordHash,
        role: 'client',
        avatar: '',
      },
      // 10 Assistants with no human profile pictures (avatar = "")
      {
        name: "Aarav Sharma",
        email: "assistant1@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Priya Nair",
        email: "assistant2@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Rohan Das",
        email: "assistant3@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Ananya Reddy",
        email: "assistant4@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Vikram Malhotra",
        email: "assistant5@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Kavitha Krishnan",
        email: "assistant6@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Siddharth Rao",
        email: "assistant7@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Meera Joshi",
        email: "assistant8@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Rahul Verma",
        email: "assistant9@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Divya Teja",
        email: "assistant10@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Rohan Sen",
        email: "assistant11@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Sneha Kapoor",
        email: "assistant12@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Tarun Verma",
        email: "assistant13@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Shalini Gupta",
        email: "assistant14@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Harish Kumar",
        email: "assistant15@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Nisha Patil",
        email: "assistant16@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Ajay Dev",
        email: "assistant17@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Manisha Shaw",
        email: "assistant18@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Suresh Naidu",
        email: "assistant19@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      },
      {
        name: "Lakshmi Bai",
        email: "assistant20@flora.com",
        password: passwordHash,
        role: "assistant",
        avatar: "",
      }
    ];

    const users = await User.insertMany(usersToCreate);
    console.log(`${users.length} Users created.`);

    // 2. Create Profiles
    const profilesToCreate = [];

    // Client Sai Kiran Profile
    const clientSai = users.find(u => u.email === 'client1@flora.com');
    profilesToCreate.push({
      userId: clientSai._id,
      phone: '+91 98480 22338',
      address: 'Sakhamaru, Vijayawada, Andhra Pradesh 522237',
      location: { type: 'Point', coordinates: [80.4982, 16.4920] },
      bio: 'Frequent business traveler looking for verified local helpers.',
    });

    // Client Deepika Profile
    const clientDeepika = users.find(u => u.email === 'client2@flora.com');
    profilesToCreate.push({
      userId: clientDeepika._id,
      phone: '+91 99890 55443',
      address: 'Tadepalle, Vijayawada, Andhra Pradesh 522501',
      location: { type: 'Point', coordinates: [80.6200, 16.4800] },
      bio: 'Terrace garden lover looking for daily watering assistance.',
    });

    // 10 Assistant Profiles
    const assistantData = [
      {
        email: "assistant1@flora.com",
        rating: 4.8,
        reviewsCount: 14,
        hourlyRate: 15,
        bio: "B.Sc. Agriculture student specializing in soil health. Passionate about local botany, organic pest control, and maintaining structured garden schedules.",
        coordinates: [80.5012, 16.4950],
        address: "Sakhamaru Center, Vijayawada, Andhra Pradesh 522237"
      },
      {
        email: "assistant2@flora.com",
        rating: 4.9,
        reviewsCount: 32,
        hourlyRate: 22,
        bio: "Professional estate manager with 4 years of experience tending to exotic tropical greenhouse plants, running residential irrigation systems, and handling basic domestic upkeep.",
        coordinates: [80.5234, 16.5021],
        address: "Near Amaravati Core, Vijayawada, Andhra Pradesh 522238"
      },
      {
        email: "assistant3@flora.com",
        rating: 4.3,
        reviewsCount: 9,
        hourlyRate: 18,
        bio: "Lifelong animal lover and neighborhood community gardener. Highly reliable for regular home walkthroughs, pet food tracking, and seasonal landscape maintenance.",
        coordinates: [80.5510, 16.4810],
        address: "Thullur Region, Vijayawada, Andhra Pradesh 522239"
      },
      {
        email: "assistant4@flora.com",
        rating: 4.7,
        reviewsCount: 21,
        hourlyRate: 25,
        bio: "Certified landscape designer offering deep botanical oversight. Specializes in drip irrigation setups, plant health assessments, and careful house sitting routines.",
        coordinates: [80.5980, 16.5120],
        address: "Tadepalle Border, Vijayawada, Andhra Pradesh 522501"
      },
      {
        email: "assistant5@flora.com",
        rating: 4.5,
        reviewsCount: 17,
        hourlyRate: 20,
        bio: "Reliable part-time farmhand and property caretaker. Experienced in handling broad lawn irrigation, basic sorting logs, and structured feeding plans for domestic pets.",
        coordinates: [80.6224, 16.5062],
        address: "Vijayawada Central, Andhra Pradesh 520001"
      },
      {
        email: "assistant6@flora.com",
        rating: 4.9,
        reviewsCount: 45,
        hourlyRate: 28,
        bio: "Top-rated homestead assistant with extensive experience managing complex property checklists, nursery care, and strict pet medication schedules during owner vacations.",
        coordinates: [80.6410, 16.5350],
        address: "Gunadala Area, Vijayawada, Andhra Pradesh 520004"
      },
      {
        email: "assistant7@flora.com",
        rating: 4.1,
        reviewsCount: 6,
        hourlyRate: 16,
        bio: "Attentive environmental science graduate focused on eco-friendly urban farming layouts. Prompt with daily checklists, mail sorting, and ensuring clean home conditions.",
        coordinates: [80.4520, 16.4410],
        address: "Mangalagiri Town, Guntur/Vijayawada, Andhra Pradesh 522503"
      },
      {
        email: "assistant8@flora.com",
        rating: 4.6,
        reviewsCount: 11,
        hourlyRate: 21,
        bio: "Experienced pet sitter and florist assistant. Adept at recognizing plant nutrient deficiencies, organizing porch gardens, and tracking precise companion pet dietary routines.",
        coordinates: [80.6680, 16.4720],
        address: "Patamata Region, Vijayawada, Andhra Pradesh 520010"
      },
      {
        email: "assistant9@flora.com",
        rating: 4.4,
        reviewsCount: 19,
        hourlyRate: 19,
        bio: "Methodical property minder and plant nursery worker. Dedicated to daily property line checks, precise garden weeding/watering cycles, and attentive pet company visits.",
        coordinates: [80.4120, 16.4150],
        address: "Guntur Outskirts, Andhra Pradesh 522002"
      },
      {
        email: "assistant10@flora.com",
        rating: 4.8,
        reviewsCount: 28,
        hourlyRate: 30,
        bio: "Premium residential caretaker offering elite horticultural care. Expert in tracking high-maintenance indoor foliage collections, managing mail drop-offs, and custom pet diets.",
        coordinates: [80.6850, 16.3210],
        address: "Outer Limit Boundary, Vijayawada Rural, Andhra Pradesh 520015"
      },
      {
        email: "assistant11@flora.com",
        rating: 4.6,
        reviewsCount: 15,
        hourlyRate: 20,
        bio: "Energetic college student with 2 years of house sitting and lawn mowing experience. Prompt with task lists.",
        coordinates: [80.6250, 16.5150],
        address: "Labbipet, Vijayawada, Andhra Pradesh 520010"
      },
      {
        email: "assistant12@flora.com",
        rating: 4.8,
        reviewsCount: 22,
        hourlyRate: 24,
        bio: "Attentive pet lover and plant care specialist. Experienced with indoor vertical gardens and feeding schedules.",
        coordinates: [80.6080, 16.4950],
        address: "Governorpet, Vijayawada, Andhra Pradesh 520002"
      },
      {
        email: "assistant13@flora.com",
        rating: 4.2,
        reviewsCount: 8,
        hourlyRate: 18,
        bio: "Local gardener offering plant watering, leaf clearing, and pet feeding services. Always reliable.",
        coordinates: [80.6550, 16.5220],
        address: "Moghalrajpuram, Vijayawada, Andhra Pradesh 520010"
      },
      {
        email: "assistant14@flora.com",
        rating: 4.9,
        reviewsCount: 37,
        hourlyRate: 26,
        bio: "Horticulture enthusiast specialized in watering sensitive plants, orchid care, and dog walking.",
        coordinates: [80.6720, 16.5450],
        address: "Ramavarappadu, Vijayawada, Andhra Pradesh 520008"
      },
      {
        email: "assistant15@flora.com",
        rating: 4.0,
        reviewsCount: 5,
        hourlyRate: 16,
        bio: "Friendly neighborhood caretaker ready to help with watering garden pots, mail retrieval, and general safety checks.",
        coordinates: [80.6120, 16.5320],
        address: "Satyanarayanapuram, Vijayawada, Andhra Pradesh 520011"
      },
      {
        email: "assistant16@flora.com",
        rating: 4.7,
        reviewsCount: 19,
        hourlyRate: 21,
        bio: "Dedicated house sitter and domestic caretaker. Skilled in organic plant feeding and handling senior dogs.",
        coordinates: [80.5750, 16.5010],
        address: "Vidyadharapuram, Vijayawada, Andhra Pradesh 520012"
      },
      {
        email: "assistant17@flora.com",
        rating: 4.5,
        reviewsCount: 13,
        hourlyRate: 19,
        bio: "Prompt and responsible assistant with references. Offers mail retrieval, garden care, and check-ins.",
        coordinates: [80.6420, 16.4850],
        address: "Krishnalanka, Vijayawada, Andhra Pradesh 520013"
      },
      {
        email: "assistant18@flora.com",
        rating: 5.0,
        reviewsCount: 52,
        hourlyRate: 32,
        bio: "Elite house manager with 5+ years of experience. Expert in complex indoor plant care, mail sorting, and pet care.",
        coordinates: [80.6950, 16.5120],
        address: "Enikepadu, Vijayawada, Andhra Pradesh 521108"
      },
      {
        email: "assistant19@flora.com",
        rating: 4.4,
        reviewsCount: 11,
        hourlyRate: 17,
        bio: "Reliable helper focused on terrace garden maintenance, custom pet feeding plans, and regular home walkthroughs.",
        coordinates: [80.5910, 16.4620],
        address: "Kanakadurga Varadhi Area, Vijayawada, Andhra Pradesh 522501"
      },
      {
        email: "assistant20@flora.com",
        rating: 4.7,
        reviewsCount: 26,
        hourlyRate: 23,
        bio: "Professional caretaker offering exceptional botanical maintenance, lawn upkeep, and domestic checkup services.",
        coordinates: [80.7250, 16.5050],
        address: "Prasadampadu, Vijayawada, Andhra Pradesh 521108"
      }
    ];

    assistantData.forEach((ast, idx) => {
      const u = users.find(usr => usr.email === ast.email);
      profilesToCreate.push({
        userId: u._id,
        phone: `+91 98481 000${idx + 1}`,
        address: ast.address,
        location: { type: 'Point', coordinates: ast.coordinates },
        bio: ast.bio,
        isVerified: true,
        services: ["Plant Watering", "Mail Retrieval", "Gardening", "Pet Feeding", "Pet Care"],
        hourlyRate: ast.hourlyRate,
        averageRating: ast.rating,
        totalReviews: ast.reviewsCount,
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
        ]
      });
    });

    const profiles = await Profile.insertMany(profilesToCreate);
    console.log(`${profiles.length} Profiles created.`);

    // 3. Create simulated Bookings and Reviews
    const astAarav = users.find(u => u.email === 'assistant1@flora.com');
    const astPriya = users.find(u => u.email === 'assistant2@flora.com');

    const booking1 = await Booking.create({
      clientId: clientSai._id,
      assistantId: astAarav._id,
      status: 'completed',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalPrice: 420,
      tasks: [
        { taskName: 'Plant Watering (1 time(s)/day)', isCompleted: true },
        { taskName: 'Mail Retrieval', isCompleted: true }
      ],
      visitProofs: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500',
          comment: 'Terrace garden watered. Soil dampness check passed.',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    await Review.create({
      bookingId: booking1._id,
      clientId: clientSai._id,
      assistantId: astAarav._id,
      rating: 5,
      comment: 'Very professional student helper. Tended to plants carefully.',
    });

    const booking2 = await Booking.create({
      clientId: clientDeepika._id,
      assistantId: astPriya._id,
      status: 'completed',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      totalPrice: 780,
      tasks: [
        { taskName: 'Pet Feeding (2 time(s)/day)', isCompleted: true },
        { taskName: 'Gardening', isCompleted: true }
      ],
      visitProofs: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
          comment: 'Fed and watered. Garden trimmed neatly.',
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    await Review.create({
      bookingId: booking2._id,
      clientId: clientDeepika._id,
      assistantId: astPriya._id,
      rating: 5,
      comment: 'Superb service. Greenhouses are completely taken care of!',
    });

    console.log('Sample bookings and reviews seeded successfully.');
    console.log('Successfully seeded 10 highly realistic multi-service caretakers across varying radiuses!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
