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
    const connURI = process.env.MONGODB_URI || 'mongodb+srv://flora_user:flora_password@cluster0.96o1pmf.mongodb.net/flora_assist?retryWrites=true&w=majority';
    console.log(`Connecting to database for seeding: ${connURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    await mongoose.connect(connURI);

    // Delete existing records
    await User.deleteMany();
    await Profile.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('Database cleared.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Core Users (Admin & Clients)
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
    ];

    // Caretakers data across 6 Major Cities (Vijayawada, Hyderabad, Bangalore, Mumbai, Delhi, Chennai)
    const assistantData = [
      // --- VIJAYAWADA ---
      {
        name: "Aarav Sharma",
        email: "aaravsharma@gmail.com",
        city: "Vijayawada",
        rating: 4.8,
        reviewsCount: 14,
        hourlyRate: 15,
        bio: "B.Sc. Agriculture student specializing in soil health. Passionate about local botany, organic pest control, and maintaining structured garden schedules.",
        coordinates: [80.5012, 16.4950],
        address: "Sakhamaru Center, Vijayawada, Andhra Pradesh 522237"
      },
      {
        name: "Priya Nair",
        email: "priyanair@gmail.com",
        city: "Vijayawada",
        rating: 4.9,
        reviewsCount: 32,
        hourlyRate: 22,
        bio: "Professional estate manager with 4 years of experience tending to exotic tropical greenhouse plants, running residential irrigation systems, and handling basic domestic upkeep.",
        coordinates: [80.5234, 16.5021],
        address: "Near Amaravati Core, Vijayawada, Andhra Pradesh 522238"
      },
      {
        name: "Rohan Das",
        email: "rohandas@gmail.com",
        city: "Vijayawada",
        rating: 4.3,
        reviewsCount: 9,
        hourlyRate: 18,
        bio: "Lifelong animal lover and neighborhood community gardener. Highly reliable for regular home walkthroughs, pet food tracking, and seasonal landscape maintenance.",
        coordinates: [80.5510, 16.4810],
        address: "Thullur Region, Vijayawada, Andhra Pradesh 522239"
      },
      {
        name: "Ananya Reddy",
        email: "ananyareddy@gmail.com",
        city: "Vijayawada",
        rating: 4.7,
        reviewsCount: 21,
        hourlyRate: 25,
        bio: "Certified landscape designer offering deep botanical oversight. Specializes in drip irrigation setups, plant health assessments, and careful house sitting routines.",
        coordinates: [80.5980, 16.5120],
        address: "Tadepalle Border, Vijayawada, Andhra Pradesh 522501"
      },
      {
        name: "Vikram Malhotra",
        email: "vikrammalhotra@gmail.com",
        city: "Vijayawada",
        rating: 4.5,
        reviewsCount: 17,
        hourlyRate: 20,
        bio: "Reliable part-time farmhand and property caretaker. Experienced in handling broad lawn irrigation, basic sorting logs, and structured feeding plans for domestic pets.",
        coordinates: [80.6224, 16.5062],
        address: "Vijayawada Central, Andhra Pradesh 520001"
      },

      // --- HYDERABAD ---
      {
        name: "Karthik Varma",
        email: "karthikvarma@gmail.com",
        city: "Hyderabad",
        rating: 4.9,
        reviewsCount: 38,
        hourlyRate: 25,
        bio: "Experienced urban gardener in Hitech City. Specialist in balcony vertical gardens, automated drip systems, and daily pet care.",
        coordinates: [78.3800, 17.4435], // Hitech City
        address: "Hitech City, Hyderabad, Telangana 500081"
      },
      {
        name: "Sravani Rao",
        email: "sravanirao@gmail.com",
        city: "Hyderabad",
        rating: 4.8,
        reviewsCount: 27,
        hourlyRate: 22,
        bio: "Passionate home sitter and plant enthusiast in Jubilee Hills. Reliable with mail collection, pet feeding, and indoor bonsai care.",
        coordinates: [78.4088, 17.4319], // Jubilee Hills
        address: "Jubilee Hills, Hyderabad, Telangana 500033"
      },
      {
        name: "Mahesh Babu K",
        email: "maheshbabu@gmail.com",
        city: "Hyderabad",
        rating: 4.7,
        reviewsCount: 19,
        hourlyRate: 20,
        bio: "Gachibowli based caretaker. Expert in terrace garden watering, dog walking, and routine property safety checks.",
        coordinates: [78.3489, 17.4401], // Gachibowli
        address: "Gachibowli, Hyderabad, Telangana 500032"
      },
      {
        name: "Divya Nambiar",
        email: "divyanambiar@gmail.com",
        city: "Hyderabad",
        rating: 5.0,
        reviewsCount: 44,
        hourlyRate: 30,
        bio: "Senior estate minder in Banjara Hills. Specialized in exotic flora care, cat sitting, and high-security home walkthroughs.",
        coordinates: [78.4482, 17.4156], // Banjara Hills
        address: "Banjara Hills, Hyderabad, Telangana 500034"
      },
      {
        name: "Praneeth Teja",
        email: "praneethteja@gmail.com",
        city: "Hyderabad",
        rating: 4.6,
        reviewsCount: 16,
        hourlyRate: 18,
        bio: "Kondapur neighborhood assistant. Prompt with daily checklists, mail sorting, lawn maintenance, and pet feeding.",
        coordinates: [78.3600, 17.4600], // Kondapur
        address: "Kondapur, Hyderabad, Telangana 500084"
      },

      // --- BANGALORE ---
      {
        name: "Arjun Gowda",
        email: "arjungowda@gmail.com",
        city: "Bangalore",
        rating: 4.9,
        reviewsCount: 41,
        hourlyRate: 28,
        bio: "Koramangala green thumb & pet lover. 4+ years keeping urban terrace gardens blooming and pets happy while owners travel.",
        coordinates: [77.6245, 12.9352], // Koramangala
        address: "Koramangala 4th Block, Bangalore, Karnataka 560034"
      },
      {
        name: "Meera Hegde",
        email: "meerahegde@gmail.com",
        city: "Bangalore",
        rating: 4.8,
        reviewsCount: 30,
        hourlyRate: 26,
        bio: "Indiranagar house minder. Expert in orchid care, succulent hydration schedules, and active dog walking.",
        coordinates: [77.6412, 12.9784], // Indiranagar
        address: "Indiranagar 100ft Road, Bangalore, Karnataka 560038"
      },
      {
        name: "Nikhil Menon",
        email: "nikhilmenon@gmail.com",
        city: "Bangalore",
        rating: 4.7,
        reviewsCount: 23,
        hourlyRate: 22,
        bio: "HSR Layout property assistant. Experienced with hydroponics, indoor foliage, mail collection, and cat care.",
        coordinates: [77.6387, 12.9121], // HSR Layout
        address: "HSR Layout Sector 1, Bangalore, Karnataka 560102"
      },
      {
        name: "Pooja Kulkarni",
        email: "poojakulkarni@gmail.com",
        city: "Bangalore",
        rating: 5.0,
        reviewsCount: 50,
        hourlyRate: 35,
        bio: "Whitefield villa caretaker. Specialized in large lawn upkeep, pet medication administration, and daily photo reports.",
        coordinates: [77.7499, 12.9698], // Whitefield
        address: "Whitefield Main Road, Bangalore, Karnataka 560066"
      },
      {
        name: "Varun Reddy",
        email: "varunreddy@gmail.com",
        city: "Bangalore",
        rating: 4.6,
        reviewsCount: 18,
        hourlyRate: 20,
        bio: "Jayanagar student caretaker. Thorough with daily task lists, indoor plant mister routines, and mail pickup.",
        coordinates: [77.5824, 12.9250], // Jayanagar
        address: "Jayanagar 4th Block, Bangalore, Karnataka 560011"
      },

      // --- MUMBAI ---
      {
        name: "Aditya Shah",
        email: "adityashah@gmail.com",
        city: "Mumbai",
        rating: 4.9,
        reviewsCount: 36,
        hourlyRate: 32,
        bio: "Bandra West residential helper. Trusted for high-rise balcony plant care, security checks, and pet sitting.",
        coordinates: [72.8295, 19.0596], // Bandra
        address: "Bandra West, Mumbai, Maharashtra 400050"
      },
      {
        name: "Rhea Kapoor",
        email: "rheakapoor@gmail.com",
        city: "Mumbai",
        rating: 4.8,
        reviewsCount: 29,
        hourlyRate: 28,
        bio: "Juhu coastal property assistant. Specialized in salt-air resistant plant care, dog walking, and mail sorting.",
        coordinates: [72.8267, 19.1075], // Juhu
        address: "Juhu Scheme, Mumbai, Maharashtra 400049"
      },
      {
        name: "Siddharth Kulkarni",
        email: "siddharthkulkarni@gmail.com",
        city: "Mumbai",
        rating: 4.7,
        reviewsCount: 20,
        hourlyRate: 25,
        bio: "Powai lake area caretaker. Reliable terrace gardener, cat feeder, and general home walkthrough manager.",
        coordinates: [72.9051, 19.1176], // Powai
        address: "Hiranandani Gardens Powai, Mumbai, Maharashtra 400076"
      },
      {
        name: "Tanvi Mehta",
        email: "tanvimehta@gmail.com",
        city: "Mumbai",
        rating: 5.0,
        reviewsCount: 48,
        hourlyRate: 38,
        bio: "Colaba heritage home sitter. Experienced in vintage garden maintenance, mail logging, and pet care.",
        coordinates: [72.8311, 18.9067], // Colaba
        address: "Colaba Causeway, Mumbai, Maharashtra 400005"
      },
      {
        name: "Karan Fernandes",
        email: "karanfernandes@gmail.com",
        city: "Mumbai",
        rating: 4.6,
        reviewsCount: 15,
        hourlyRate: 22,
        bio: "Andheri West property helper. Quick, punctual, and reliable with daily plant watering and pet check-ins.",
        coordinates: [72.8333, 19.1197], // Andheri
        address: "Lokhandwala Andheri West, Mumbai, Maharashtra 400053"
      },

      // --- DELHI ---
      {
        name: "Kabir Chaudhry",
        email: "kabirchaudhry@gmail.com",
        city: "Delhi",
        rating: 4.9,
        reviewsCount: 39,
        hourlyRate: 30,
        bio: "South Ext botanist & property minder. Expert in seasonal flower beds, air-purifying indoor foliage, and dog care.",
        coordinates: [77.2197, 28.5708], // South Ext
        address: "South Extension Part 2, New Delhi 110049"
      },
      {
        name: "Simran Kaur",
        email: "simrankaur@gmail.com",
        city: "Delhi",
        rating: 4.8,
        reviewsCount: 31,
        hourlyRate: 27,
        bio: "Hauz Khas Enclave caretaker. Dedicated to courtyard plant hydration, pet exercise, and mail collection.",
        coordinates: [77.2066, 28.5494], // Hauz Khas
        address: "Hauz Khas Village, New Delhi 110016"
      },
      {
        name: "Gaurav Sharma",
        email: "gauravsharma@gmail.com",
        city: "Delhi",
        rating: 4.7,
        reviewsCount: 22,
        hourlyRate: 24,
        bio: "Connaught Place house sitter. Reliable with central Delhi home checks, pot weeding, and cat feeding.",
        coordinates: [77.2167, 28.6315], // Connaught Place
        address: "Connaught Place Block C, New Delhi 110001"
      },
      {
        name: "Anushka Malik",
        email: "anushkamalik@gmail.com",
        city: "Delhi",
        rating: 5.0,
        reviewsCount: 45,
        hourlyRate: 36,
        bio: "Vasant Vihar homestead assistant. Professional plant health inspector, pet care expert, and property supervisor.",
        coordinates: [77.1610, 28.5562], // Vasant Vihar
        address: "Vasant Vihar, New Delhi 110057"
      },
      {
        name: "Rishabh Verma",
        email: "rishabhverma@gmail.com",
        city: "Delhi",
        rating: 4.6,
        reviewsCount: 17,
        hourlyRate: 21,
        bio: "Dwarka Sector 10 assistant. Prompt with daily checklists, lawn watering, mail logging, and pet visits.",
        coordinates: [77.0500, 28.5800], // Dwarka
        address: "Dwarka Sector 10, New Delhi 110075"
      },

      // --- CHENNAI ---
      {
        name: "Karthikeyan S",
        email: "karthikeyans@gmail.com",
        city: "Chennai",
        rating: 4.9,
        reviewsCount: 40,
        hourlyRate: 26,
        bio: "T. Nagar garden caretaker. Specialist in tropical flowering plants, coconut palm care, and dog walking.",
        coordinates: [80.2337, 13.0418], // T. Nagar
        address: "T. Nagar, Chennai, Tamil Nadu 600017"
      },
      {
        name: "Lakshmi Sundaram",
        email: "lakshmisundaram@gmail.com",
        city: "Chennai",
        rating: 4.8,
        reviewsCount: 28,
        hourlyRate: 24,
        bio: "Adyar coastal plant specialist. Experienced in balcony pot hydration, cat sitting, and daily mail retrieval.",
        coordinates: [80.2565, 13.0012], // Adyar
        address: "Adyar Depot Area, Chennai, Tamil Nadu 600020"
      },
      {
        name: "Vijay Anand",
        email: "vijayanand@gmail.com",
        city: "Chennai",
        rating: 4.7,
        reviewsCount: 21,
        hourlyRate: 22,
        bio: "Velachery neighborhood helper. Prompt with terrace garden watering, home security checks, and pet care.",
        coordinates: [80.2170, 12.9815], // Velachery
        address: "Velachery Main Road, Chennai, Tamil Nadu 600042"
      },
      {
        name: "Ramya Iyer",
        email: "ramyaiyer@gmail.com",
        city: "Chennai",
        rating: 5.0,
        reviewsCount: 47,
        hourlyRate: 32,
        bio: "Anna Nagar villa supervisor. Expert in bonsai maintenance, pet feeding routines, and comprehensive visit logs.",
        coordinates: [80.2090, 13.0850], // Anna Nagar
        address: "Anna Nagar West, Chennai, Tamil Nadu 600040"
      },
      {
        name: "Santhosh Kumar",
        email: "santhoshkumar@gmail.com",
        city: "Chennai",
        rating: 4.6,
        reviewsCount: 16,
        hourlyRate: 19,
        bio: "Mylapore traditional garden minder. Thorough with daily watering schedules, mail sorting, and pet visits.",
        coordinates: [80.2676, 13.0339], // Mylapore
        address: "Mylapore Temple Area, Chennai, Tamil Nadu 600004"
      }
    ];

    // Create User accounts for all Caretakers
    for (const ast of assistantData) {
      usersToCreate.push({
        name: ast.name,
        email: ast.email,
        password: passwordHash,
        role: "assistant",
        avatar: "",
      });
    }

    const users = await User.insertMany(usersToCreate);
    console.log(`${users.length} Users created across 6 cities.`);

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

    // Create Profiles for all Assistants
    assistantData.forEach((ast, idx) => {
      const u = users.find(usr => usr.email === ast.email);
      profilesToCreate.push({
        userId: u._id,
        phone: `+91 98481 000${(idx + 1).toString().padStart(2, '0')}`,
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
    console.log(`${profiles.length} Profiles created across Vijayawada, Hyderabad, Bangalore, Mumbai, Delhi, and Chennai.`);

    // 3. Create simulated Bookings and Reviews
    const astAarav = users.find(u => u.email === 'aaravsharma@gmail.com');
    const astPriya = users.find(u => u.email === 'priyanair@gmail.com');

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
      comment: 'Very professional helper. Tended to plants carefully.',
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
    console.log('Successfully seeded 30+ caretakers with @gmail.com email addresses across 6 major cities!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
