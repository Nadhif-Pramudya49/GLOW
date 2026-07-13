const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, rating, wifiRating, workspaceRating, ambienceRating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'bookingId dan rating diperlukan.' });
    }

    // 1. Pastikan booking adalah milik pengguna ini
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: userId,
      },
      include: {
        package: {
          include: {
            location: true
          }
        },
        review: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan atau bukan milik Anda.' });
    }

    // 2. Pastikan booking belum diulas
    if (booking.review) {
      return res.status(400).json({ error: 'Anda sudah mengulas booking ini.' });
    }

    // 3. Buat ulasan
    const newReview = await prisma.review.create({
      data: {
        bookingId: booking.id,
        rating: parseInt(rating),
        wifiRating: parseInt(wifiRating || rating),
        workspaceRating: parseInt(workspaceRating || rating),
        ambienceRating: parseInt(ambienceRating || rating),
        comment: comment || '',
        tags: req.body.tags || [],
        photos: req.body.photos || []
      }
    });

    // 4. Perbarui rata-rata rating pada tabel Location
    const locationId = booking.package.locationId;
    
    // Cari semua ulasan untuk lokasi ini
    const allReviewsForLocation = await prisma.review.findMany({
      where: {
        booking: {
          package: {
            locationId: locationId
          }
        }
      }
    });

    const totalReviews = allReviewsForLocation.length;
    const sumRatings = allReviewsForLocation.reduce((acc, rev) => acc + rev.rating, 0);
    const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;

    await prisma.location.update({
      where: { id: locationId },
      data: {
        rating: parseFloat(averageRating),
        reviews: totalReviews
      }
    });

    res.status(201).json({ message: 'Ulasan berhasil disimpan.', data: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat menyimpan ulasan.' });
  }
};

exports.getRecentReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                fullName: true
              }
            },
            package: {
              include: {
                location: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      wifiRating: r.wifiRating,
      workspaceRating: r.workspaceRating,
      ambienceRating: r.ambienceRating,
      comment: r.comment,
      tags: r.tags || [],
      photos: r.photos || [],
      createdAt: r.createdAt,
      userName: r.booking.user.fullName,
      locationName: r.booking.package.location.name,
      locationId: r.booking.package.locationId
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil ulasan terbaru.' });
  }
};

exports.getReviewsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          package: {
            locationId: parseInt(locationId)
          }
        }
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                fullName: true
              }
            },
            package: {
              include: {
                location: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format ulang respons agar lebih mudah dibaca oleh frontend
    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      wifiRating: r.wifiRating,
      workspaceRating: r.workspaceRating,
      ambienceRating: r.ambienceRating,
      comment: r.comment,
      tags: r.tags || [],
      photos: r.photos || [],
      createdAt: r.createdAt,
      userName: r.booking.user.fullName,
      locationName: r.booking.package.location.name
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil ulasan.' });
  }
};
