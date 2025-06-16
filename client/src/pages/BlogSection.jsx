import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { InterestSelectionModal } from "../components/InterestSelectionModal";
import { BlogCard } from "../components/BlogCard";

// Define CSS for the fade-in animation
const fadeInAnimation = document.createElement("style");
fadeInAnimation.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;
document.head.appendChild(fadeInAnimation);
import {
  generateUserId,
  hasCompletedInterestSelection,
  markInterestSelectionCompleted,
  getStoredInterests,
  storeInterests,
} from "../utils/userUtils";
import { interestsAPI, newsAPI } from "../utils/apiService";

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  // State management
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // State for selected blog

  // User ID management
  const [userId] = useState(() => generateUserId());

  useEffect(() => {
    initializeBlog();
  }, []);

  const initializeBlog = async () => {
    try {
      setLoading(true);

      const firstVisit = !hasCompletedInterestSelection();
      setIsFirstVisit(firstVisit);

      if (firstVisit) {
        setShowInterestModal(true);
        setLoading(false);
        return;
      }

      await loadUserInterestsAndNews();
    } catch (error) {
      console.error("Error initializing blog:", error);
      setError("Failed to load personalized news. Displaying fallback articles.");

      const fallbackArticles = getFallbackArticles();
      setArticles(fallbackArticles);
      setDisplayedArticles(fallbackArticles);
      setLoading(false);
    }
  };

  const loadUserInterestsAndNews = async () => {
    try {
      // Try to get interests from API
      const interestsResponse = await interestsAPI.getUserInterests(userId);

      if (interestsResponse.success && interestsResponse.interests.length > 0) {
        setUserInterests(interestsResponse.interests);
        storeInterests(interestsResponse.interests);
        await fetchNewsByInterests(interestsResponse.interests);
      } else {
        // Fallback to stored interests or default
        const storedInterests = getStoredInterests();
        if (storedInterests.length > 0) {
          setUserInterests(storedInterests);
          await fetchNewsByInterests(storedInterests);
        } else {
          // Default to technology if no interests found
          const defaultInterests = ["technology"];
          setUserInterests(defaultInterests);
          await fetchNewsByInterests(defaultInterests);
        }
      }
    } catch (error) {
      console.error("Error loading user interests:", error);
      // Fallback to default interests
      const defaultInterests = ["technology"];
      setUserInterests(defaultInterests);
      await fetchNewsByInterests(defaultInterests);
    }
  };
  const fetchNewsByInterests = async (interests) => {
    try {
      setLoading(true);
      setError(null);
      setAllImagesLoaded(false);
      setImagesLoaded(0);

      const randomInterests = [...interests];
      ["technology", "business", "health", "entertainment"].forEach((interest) => {
        if (!randomInterests.includes(interest)) {
          randomInterests.push(interest);
        }
      });

      const shuffledInterests = randomInterests.sort(() => Math.random() - 0.5);
      const allNewsArticles = await newsAPI.fetchNewsWithFallback(shuffledInterests);

      const articlesWithIndex = allNewsArticles
        .filter((article) => article.urlToImage)
        .map((article, index) => ({ ...article, animationIndex: index }));

      const shuffledArticles = articlesWithIndex.sort(() => Math.random() - 0.5);
      setArticles(shuffledArticles);

      setTimeout(() => {
        preloadArticleImages(shuffledArticles);
      }, 3000);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news articles. Displaying fallback articles.");

      const fallbackArticles = getFallbackArticles();
      setArticles(fallbackArticles);
      setDisplayedArticles(fallbackArticles);
      setLoading(false);
    }
  };

  // Preload images to avoid broken layouts
  const preloadArticleImages = (articles) => {
    // Limit to 18 articles max
    const limitedArticles = articles.slice(0, 18);
    const totalImagesToLoad = limitedArticles.length;

    if (totalImagesToLoad === 0) {
      setLoading(false);
      setAllImagesLoaded(true);
      return;
    }

    let loadedCount = 0;

    limitedArticles.forEach((article) => {
      if (!article.urlToImage) {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
      };
      img.onerror = () => {
        // Replace with placeholder for failed images
        article.urlToImage = "https://via.placeholder.com/800x400?text=News";
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount >= totalImagesToLoad) {
          finishLoading(limitedArticles);
        }
      };
      img.src = article.urlToImage;
    });
  };

  const finishLoading = (articles) => {
    // Show articles with a slight delay to ensure smooth transition
    setTimeout(() => {
      setDisplayedArticles(articles);
      setLoading(false);
      setAllImagesLoaded(true);
    }, 500);
  };

  const handleSaveInterests = async (selectedInterests) => {
    try {
      // Save to API
      if (isFirstVisit) {
        await interestsAPI.createUserInterests(userId, selectedInterests);
      } else {
        await interestsAPI.updateUserInterests(userId, selectedInterests);
      }

      // Update local state
      setUserInterests(selectedInterests);
      storeInterests(selectedInterests);

      // Mark as completed for first-time users
      if (isFirstVisit) {
        markInterestSelectionCompleted();
        setIsFirstVisit(false);
      }

      // Fetch new articles based on updated interests
      await fetchNewsByInterests(selectedInterests);
    } catch (error) {
      console.error("Error saving interests:", error);
      throw error;
    }
  };

  // Ensure proper error handling and fallback mechanisms
  const handleRefreshNews = async () => {
    setRefreshing(true);
    try {
      await fetchNewsByInterests(userInterests);
    } catch (error) {
      console.error("Error refreshing news:", error);
      setError("Failed to refresh news. Please try again.");
    } finally {
      setRefreshing(false);
    }
    console.log(articles); // Log articles for debugging
  };
  const getFallbackArticles = () => {
    return [
      {
        id: 1,
        title: "Fallback Article",
        description: "This is a fallback article.",
        url: "#",
        urlToImage: "/public/voice-search.png",
        source: { name: "Fallback Source" },
        publishedAt: new Date().toISOString(),
        category: "general",
      },
      {
        id: 2,
        source: {
          id: null,
          name: "The Boston Globe",
        },
        author: null,
        title:
          "Person contagious with measles visited Boston public spaces - The Boston Globe",
        description:
          "A traveler contagious with measles visited multiple public places in Boston from June 7-8, health officials said.",
        url: "https://www.bostonglobe.com/2025/06/14/metro/contagious-measles-visits-boston/",
        urlToImage:
          "https://www.bostonglobe.com/pf/resources/images/logo-bg.jpg?d=557",
        publishedAt: "2025-06-14T22:03:27Z",
        content:
          "A traveler contagious with measles visited multiple public places in Boston from June 7-8, health officials said. \r\nThe Boston Public Health Commission and the Massachusetts Department of Public Heal… [+953 chars]",
        category: "general",
        animationIndex: 52,
      },
      {
        id: 3,
        source: {
          id: null,
          name: "Financial Times",
        },
        author: "Jamie Smyth, Tom Wilson",
        title:
          "Why Saudi Arabia raised oil output before Israel’s attack on Iran - Financial Times",
        description:
          "The US was pushing Riyadh for more crude but cartel politics were a more likely reason for the increase",
        url: "https://www.ft.com/content/eb36f6d0-40d2-4b9a-9f41-831af9eaa881",
        urlToImage:
          "https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2Fa079565c-c40e-44f1-a623-49c3a672cae3.jpg?source=next-barrier-page",
        publishedAt: "2025-06-15T04:00:32Z",
        content:
          "White House Watch newsletter\r\nSign up for your free, indispensable guide to what Trumps second term means for Washington, business and the world.",
        category: "business",
        animationIndex: 20,
      },
      {
        id: 4,
        source: {
          id: null,
          name: "SlashGear",
        },
        author: "Dauglas Denga",
        title:
          "This Powerful Airplane Engine Has Been Around For Over 70 Years & Is Still Used Today - SlashGear",
        description:
          "The Lycoming O-320 engine, a four-cylinder, horizontally opposed, air-cooled engine, is so reliable that they are still in use today despite being 70 years old.",
        url: "https://www.slashgear.com/1882869/airplane-piston-engine-70-years-old-how-much-power/",
        urlToImage:
          "https://www.slashgear.com/img/gallery/this-powerful-airplane-engine-has-been-around-for-over-70-years-is-still-used-today/l-intro-1749577917.jpg",
        publishedAt: "2025-06-14T16:00:00Z",
        content:
          "The Lycoming O-320 has several features that make it stand out among its peers. One aspect is its magneto ignition system, which features a self-contained engine-driven alternating current generator … [+1168 chars]",
        category: "technology",
        animationIndex: 3,
      },
      {
        id: 5,
        source: {
          id: null,
          name: "PsyPost",
        },
        author: "Eric W. Dolan",
        title:
          "Problematic porn use remains stable over time and is strongly linked to mental distress, study finds - PsyPost",
        description:
          "A yearlong study of more than 4,000 U.S. adults found that problematic pornography use tends to persist over time and is strongly associated with higher levels of anxiety and depression, suggesting a lasting link between porn dysregulation and psychological d…",
        url: "https://www.psypost.org/problematic-porn-use-remains-stable-over-time-and-is-strongly-linked-to-mental-distress-study-finds/",
        urlToImage:
          "https://www.psypost.org/wp-content/uploads/2025/02/sad-young-man.jpg",
        publishedAt: "2025-06-14T18:03:26Z",
        content:
          "A new longitudinal study has found that problematic pornography use tends to remain stable over time and is strongly associated with psychological distress such as anxiety and depression. The finding… [+7349 chars]",
        category: "health",
        animationIndex: 60,
      },
      {
        id: 6,
        source: {
          id: null,
          name: "Deadline",
        },
        author: "Natalie Oganesyan",
        title:
          "‘The Boys’ Star Erin Moriarty Shares Graves’ Disease Diagnosis - Deadline",
        description:
          "'The Boys' star Erin Moriarty shared she was diagnosed with Graves' disease, advocating for people to listen to their bodies, especially when in pain.",
        url: "http://deadline.com/2025/06/the-boys-star-erin-moriarty-graves-disease-diagnosis-1236434289/",
        urlToImage:
          "https://deadline.com/wp-content/uploads/2025/06/erin.jpg?w=1024",
        publishedAt: "2025-06-15T03:15:00Z",
        content:
          "The Boysstar Erin Moriarty shared she was recently diagnosed with Graves’ disease, advocating for people to listen to their bodies, especially when in pain.\r\n“Autoimmune disease manifests differently… [+2795 chars]",
        category: "entertainment",
        animationIndex: 72,
      },
      {
        id: 7,
        source: {
          id: null,
          name: "MacRumors",
        },
        author: "Joe Rossignol",
        title:
          "iPhone 17 Pro Launching in Three Months With These 12 New Features - MacRumors",
        description:
          "The iPhone 17 Pro and iPhone 17 Pro Max are three months away, and there are plenty of rumors about the devices.   Below, we recap key changes...",
        url: "https://www.macrumors.com/2025/06/14/iphone-17-pro-and-pro-max-rumors/",
        urlToImage:
          "https://images.macrumors.com/t/Ka9AiEjd1-um03YQzxAPPlLN9K8=/2500x/article-new/2025/04/iPhone-17-Pro-Blue-Feature-Tighter-Crop.jpg",
        publishedAt: "2025-06-15T00:45:00Z",
        content:
          "The iPhone 17 Pro and iPhone 17 Pro Max are three months away, and there are plenty of rumors about the devices.\r\nBelow, we recap key changes rumored for the iPhone 17 Pro models as of June 2025:\r\n<u… [+2669 chars]",
        category: "technology",
        animationIndex: 0,
      },
      {
        id: 8,
        source: {
          id: null,
          name: "BBC News",
        },
        author: null,
        title: "Can the Beckham brand survive reports of family feud? - BBC",
        description:
          "A PR expert says coverage has begun to affect the family's public image, with it taking a more soap-opera-like tone.",
        url: "https://www.bbc.com/news/articles/cd62dq8gevpo",
        urlToImage:
          "https://ichef.bbci.co.uk/news/1024/branded_news/c732/live/fd2f7e40-487f-11f0-9471-e380f647874e.jpg",
        publishedAt: "2025-06-14T23:08:04Z",
        content:
          "Yasmin Rufo &amp; Alex Taylor\r\nSir David Beckham and wife Lady Beckham with son Brooklyn and his wife Nicola Peltz\r\nThe anointment of Sir David Beckham is a moment of establishment recognition three … [+8480 chars]",
        category: "entertainment",
        animationIndex: 75,
      },
      {
        id: 9,
        source: {
          id: "bloomberg",
          name: "Bloomberg",
        },
        author: "Galit Altstein, Arsalan Shahla, Marissa Newman",
        title:
          "Israel Attacks Tehran as Iran Fires Another Missile Salvo - Bloomberg.com",
        description:
          "Israel and Iran continued intense bombardments of one another for a third day, with growing international concern the conflict will spread across one of the world’s key oil-producing regions. Middle East equity markets declined.",
        url: "https://www.bloomberg.com/news/articles/2025-06-14/israel-attacks-tehran-as-iran-fires-another-missile-salvo",
        urlToImage:
          "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/intTNo_62BhI/v1/1200x800.jpg",
        publishedAt: "2025-06-15T07:41:38Z",
        content:
          "Israel and Iran continued intense bombardments of one another for a third day, with growing international concern the conflict will spread across one of the worlds key oil-producing regions. Middle E… [+279 chars]",
        category: "general",
        animationIndex: 37,
      },
      {
        id: 10,
        source: {
          id: null,
          name: "Wccftech",
        },
        author: null,
        title:
          "Apple’s SVP Of Software Engineering Craig Federighi Wants To Maintain The iPad’s Simplicity, Making It The Best Touch Computer, As He Responds To The Possibility Of These Tablets Running macOS - Wccftech",
        description:
          "Talking in an interview, Apple’s Craig Federighi believes that the iPad’s simplicity should be maintained, which is why it might never run macOS",
        url: "https://wccftech.com/apple-craig-federighi-interview-why-macos-will-not-come-to-the-ipad/",
        urlToImage:
          "https://cdn.wccftech.com/wp-content/uploads/2025/06/iPadOS-26-1.jpg",
        publishedAt: "2025-06-14T09:06:00Z",
        content:
          "The Liquid Glass UI makeover was not the only change Apple introduced with iPadOS 26, because the company has now increased the productivity list for compatible tablets, bringing multitasking to the … [+2057 chars]",
        category: "technology",
        animationIndex: 16,
      },
      {
        id: 11,
        source: {
          id: null,
          name: "EventHubs",
        },
        author: "Dakota DarkHorse Hills",
        title:
          "Street Fighter 6 input lag tests on Nintendo Switch 2 reveal higher latency results than most other systems - EventHubs",
        description:
          "The fighting game community has a new console to play their titles on at home and on the go with the Nintendo Switch 2, but how does it hold up in terms of input lag?Well, we have some answers ...",
        url: "https://www.eventhubs.com/news/2025/jun/14/street-fighter-6-switch-lag/",
        urlToImage:
          "https://media.eventhubs.com/images/2025/06/13-sf6-switch-lagt.webp",
        publishedAt: "2025-06-14T22:53:06Z",
        content:
          "The fighting game community has a new console to play their titles on at home and on the go with the Nintendo Switch 2, but how does it hold up in terms of input lag?\r\nWell, we have some answers on t… [+2824 chars]",
        category: "technology",
        animationIndex: 1,
      },
      {
        id: 12,
        source: {
          id: "the-washington-post",
          name: "The Washington Post",
        },
        author:
          "Elahe Izadi, Lucy Perkins, Ariel Plotnick, Sabby Robinson, Sean Carter, Lucy Perkins, Ariel Plotnick, Sabby Robinson, Sean Carter",
        title:
          "The Diddy trial: “Jane,” the government’s sleeper witness - The Washington Post",
        description:
          "The anonymous testimony from one of Sean “Diddy” Combs’s ex-girlfriends that’s at the heart of the government’s sex-trafficking allegations.",
        url: "https://www.washingtonpost.com/podcasts/post-reports/the-diddy-trial-jane-the-governments-sleeper-witness/",
        urlToImage:
          "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://podcast.posttv.com/series/20250613/t_1749844089082_name_KUKVWHPYJ5ASDNRAUXNML6RVVQ.jpg&w=1440",
        publishedAt: "2025-06-14T16:04:07Z",
        content:
          "Until the past week, not much was known about Jane, one of the alleged victims at the center of the governments case against Sean Combs. Jane who is going by a court-approved alias to protect her ide… [+911 chars]",
        category: "entertainment",
        animationIndex: 83,
      },
      {
        id: 13,
        source: {
          id: null,
          name: "NOLA.com",
        },
        author: "MADDIE SCOTT | Staff writer",
        title:
          "With red carpet and a second line, New Orleans welcomes 6,000 Pokémon competitors - NOLA.com",
        description:
          "Pikachu and Eevee second line at day 1 of the Pokémon North America International Championships in New Orleans.",
        url: "https://www.nola.com/news/pokmon-north-atlantic-international-championships/article_50bd6d88-1d82-4716-8bb7-8bf358ee0192.html",
        urlToImage:
          "https://bloximages.newyork1.vip.townnews.com/nola.com/content/tncms/assets/v3/editorial/1/86/18632666-6802-465d-8317-e1f8a144011c/684c973a60035.image.jpg?crop=1662%2C873%2C0%2C187&resize=1200%2C630&order=crop%2Cresize",
        publishedAt: "2025-06-14T09:00:00Z",
        content:
          "In another area, master division players, those 16 and older, were engaged in mostly silent battles as Pokémon Professors, which act as referees, roamed the area to keep a watchful eye on matches.\r\nA… [+731 chars]",
        category: "technology",
        animationIndex: 17,
      },
      {
        id: 14,
        source: {
          id: null,
          name: "Space.com",
        },
        author: "Fran Ruiz",
        title:
          "'The Alters' is a genre-blending sci-fi survival ordeal about the horrors of being a project manager - Space",
        description:
          "11 bit studios' sci-fi adventure makes you team leader and asks you to balance base-building, survival, branching narratives, and keeping your team motivated.",
        url: "https://www.space.com/entertainment/space-games/the-alters-is-a-genre-blending-sci-fi-survival-ordeal-about-the-horrors-of-being-a-project-manager",
        urlToImage:
          "https://cdn.mos.cms.futurecdn.net/2NLcDPihuvnhemXMiku7fZ.jpg",
        publishedAt: "2025-06-14T16:00:00Z",
        content:
          "We wouldn't bat an eye if you compared Jan Dolski, the protagonist of The Alters, to Robert Pattinson's Mickey Barnes after playing two hours of 11 bit studios' latest. It's the sort of space video g… [+5109 chars]",
        category: "technology",
        animationIndex: 4,
      },
      {
        id: 15,
        source: {
          id: null,
          name: "9to5Mac",
        },
        author: "Benjamin Mayo",
        title:
          "Why is it called iOS 26? What happened to iOS 19 for iPhone - 9to5Mac",
        description:
          "So, Apple just held its annual WWDC conference where it announces all the new software for the next year. And...",
        url: "https://9to5mac.com/2025/06/14/why-is-it-called-ios-26-what-happened-to-ios-19-for-iphone/",
        urlToImage:
          "https://i0.wp.com/9to5mac.com/wp-content/uploads/sites/6/2025/06/ios-26-what-happened-to-ios-19.jpg?resize=1200%2C628&quality=82&strip=all&ssl=1",
        publishedAt: "2025-06-14T15:05:00Z",
        content:
          "So, Apple just held its annual WWDC conference where it announces all the new software for the next year. And the company proudly announced the next version of iOS for the iPhone, iOS 26. If you have… [+2520 chars]",
        category: "technology",
        animationIndex: 7,
      },
      {
        id: 16,
        source: {
          id: "the-times-of-india",
          name: "The Times of India",
        },
        author: "ETimes.in",
        title:
          "5 health issues that can occur due to Vitamin D deficiency - Times of India",
        description:
          "Vitamin D, known as the sunshine vitamin, is extremely crucial for our body, as it helps in keeping our bones strong, muscles healthy, and the immune system working strong. Despite being a largely tropical country, 1 in 4 Indians are deficient in Vitamin D du…",
        url: "https://timesofindia.indiatimes.com/life-style/health-fitness/health-news/5-health-issues-that-can-occur-due-to-vitamin-d-deficiency/photostory/121846994.cms",
        urlToImage: "https://static.toiimg.com/photo/121847050.cms",
        publishedAt: "2025-06-14T23:30:00Z",
        content:
          "Vitamin D helps the body absorb calcium and phosphorus, which are important to build strong bones. Without enough vitamin D, your body cannot absorb these minerals properly. This can lead to soft, we… [+442 chars]",
        category: "health",
        animationIndex: 54,
      },
      {
        id: 17,
        source: {
          id: null,
          name: "NBCSports.com",
        },
        author: "Golf Channel Staff",
        title:
          "U.S. Open 2025: Final-round tee times, pairings and featured groups Sunday at Oakmont - NBC Sports",
        description:
          "Here's a look at the final-round tee times, pairings and featured groups at the U.S. Open.",
        url: "https://www.nbcsports.com/golf/news/u-s-open-2025-final-round-tee-times-pairings-and-featured-groups-sunday-at-oakmont",
        urlToImage:
          "https://nbcsports.brightspotcdn.com/dims4/default/f98427a/2147483647/strip/true/crop/4889x2750+0+0/resize/1440x810!/quality/90/?url=https%3A%2F%2Fnbc-sports-production-nbc-sports.s3.us-east-1.amazonaws.com%2Fbrightspot%2F8f%2Fec%2Fdc88597b426fa0d1e2ad6b9bd5b3%2Fhttps-api-imagn.com%2Frest%2Fdownload%2FimageID%3D26454098",
        publishedAt: "2025-06-15T00:22:30Z",
        content:
          "The mens third major of the season comes to a conclusion Sunday at Oakmont Country Club, where the 125th U.S. Open champion will be crowned.\r\nNBC, Peacock and USA Network will have live action with t… [+3191 chars]",
        category: "general",
        animationIndex: 49,
      },
    ];
  };

  const getInterestDisplayNames = () => {
    const displayNames = {
      business: "Business",
      entertainment: "Entertainment",
      general: "General",
      health: "Health",
      science: "Science",
      sports: "Sports",
      technology: "Technology",
    };

    return userInterests
      .map((interest) => displayNames[interest] || interest)
      .join(", ");
  };

  const handleShowPopup = (blog) => {
    setSelectedBlog(blog);
  };

  const handleClosePopup = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-dark-100 dark:to-dark-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-100/80 via-primary-200/80 to-accent-yellow/30 dark:from-dark-100/80 dark:via-dark-200/80 dark:to-accent-yellow/20 backdrop-blur-sm border-b border-primary-200/30 dark:border-dark-600/30 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-primary-300 dark:text-primary-200">
            Personalized News Feed
          </h1>

          {/* Settings Button */}
          <button
            onClick={() => setShowInterestModal(true)}
            className="p-2 text-primary-200 hover:text-primary-300 hover:bg-primary-100/20 dark:text-primary-100 dark:hover:text-primary-50 dark:hover:bg-dark-600/20 rounded-lg transition-colors"
            title="Edit Interests"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Interest Display */}
      {userInterests.length > 0 && (
        <div className="bg-white/90 dark:bg-dark-50/90 shadow-sm p-4 border-b border-primary-100/20 dark:border-dark-600/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-200 dark:text-primary-100">
                  Your Interests:
                </p>
                <p className="font-medium text-primary-300 dark:text-primary-50">
                  {getInterestDisplayNames()}
                </p>
              </div>

              <Button
                onClick={handleRefreshNews}
                disabled={refreshing}
                className="bg-primary-200 hover:bg-primary-300 dark:bg-primary-100 dark:hover:bg-primary-200 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh News</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* News Articles Grid */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-200 dark:border-primary-100 mb-4"></div>
            <p className="text-primary-200 dark:text-primary-100">
              Loading your personalized news...
            </p>
            {imagesLoaded > 0 && (
              <div className="mt-4 text-sm text-primary-100 dark:text-primary-50">
                <div className="w-56 bg-primary-100/20 dark:bg-dark-600/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-200 dark:bg-primary-100 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(imagesLoaded / 18) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center mt-2">
                  Preparing {imagesLoaded} of 18 articles
                </p>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/30">
            <div className="text-red-500 dark:text-red-400 text-4xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-300 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={handleRefreshNews}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </Button>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center p-8 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30">
            <div className="text-yellow-500 dark:text-yellow-400 text-4xl mb-4">
              📰
            </div>
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-2">
              No articles found
            </h3>
            <p className="text-yellow-500 dark:text-yellow-400 mb-4">
              Try updating your interests or refreshing the page.
            </p>
            <Button
              onClick={() => setShowInterestModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Update Interests
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-300 dark:text-primary-200 mb-2">
                Your Personalized News Feed
              </h2>
              <p className="text-primary-200 dark:text-primary-100">
                {displayedArticles.length} articles based on your interests
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${(article.animationIndex % 18) * 150}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <BlogCard article={article} onReadMore={handleShowPopup} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/90 dark:bg-dark-50/90 py-4 text-center text-sm text-primary-200 dark:text-primary-100 border-t border-primary-100/20 dark:border-dark-600/20">
        <p>
          Powered by{" "}
          <a
            href="https://newsapi.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-300 hover:text-primary-400 dark:text-primary-200 dark:hover:text-primary-100 hover:underline transition-colors"
          >
            NewsAPI.org
          </a>
        </p>
      </div>

      {/* Interest Selection Modal */}
      <InterestSelectionModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        onSave={handleSaveInterests}
        initialInterests={userInterests}
        title={
          isFirstVisit
            ? "Welcome! Select Your Interests"
            : "Edit Your Interests"
        }
        description={
          isFirstVisit
            ? "Choose the topics you're interested in to personalize your news feed."
            : "Update your interests to see different news articles."
        }
      />

      {/* Popup for Blog Details */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-dark-50/95 rounded-lg shadow-xl p-6 max-w-3xl w-full relative overflow-y-auto max-h-screen border border-primary-100/20 dark:border-dark-600/20">
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-primary-200 hover:text-primary-300 dark:text-primary-100 dark:hover:text-primary-50 transition-colors"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary-300 dark:text-primary-200">
              {selectedBlog.title}
            </h2>
            <img
              src={selectedBlog.urlToImage || "/public/voice-search.png"}
              alt={selectedBlog.title}
              className="w-full h-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-primary-200 dark:text-primary-100 mb-4">
              {selectedBlog.description}
            </p>
            <a
              href={selectedBlog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-primary-400 dark:text-primary-200 dark:hover:text-primary-100 hover:underline transition-colors"
            >
              Read Full Article
            </a>
            <div className="text-sm text-primary-100 dark:text-primary-50 mt-4">
              Published on:{" "}
              {new Date(selectedBlog.publishedAt).toLocaleDateString()}
            </div>
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(
                  selectedBlog.title
                );
                window.speechSynthesis.speak(utterance);
              }}
              className="mt-4 bg-primary-200 hover:bg-primary-300 dark:bg-primary-100 dark:hover:bg-primary-200 text-white px-3 py-1 rounded-full
               transition-all duration-200 transform hover:scale-105 hover:shadow-md
               flex items-center justify-center text-sm"
              title="Speak Headline"
            >
              🔊 Speak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
