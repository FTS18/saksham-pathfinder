import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({ origin: true });

/**
 * Fetch internship data by ID for OG tag generation
 * Called by Netlify Functions to generate dynamic social media previews
 */
export const getInternshipForOG = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const internshipId = req.query.id || req.path?.split('/').pop();

      if (!internshipId) {
        return res.status(400).json({ error: 'Internship ID required' });
      }

      // Fetch from Firestore
      const doc = await admin.firestore().collection('internships').doc(internshipId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Internship not found' });
      }

      const data = doc.data();

      // Return only necessary fields for OG tags (keep response small)
      return res.json({
        id: doc.id,
        title: data?.title || 'Internship',
        company: data?.company || 'Company',
        description: data?.description || '',
        location: data?.location || 'India',
        stipend: data?.stipend || 'Competitive',
        sector: data?.sector || 'Technology',
        logo: data?.logo || null,
        work_mode: data?.work_mode || 'Not specified',
      });
    } catch (error) {
      console.error('Error fetching internship:', error);
      return res.status(500).json({ error: 'Failed to fetch internship data' });
    }
  });
});

/**
 * Batch fetch internship data (for comparison pages)
 * Called to generate OG tags for shared comparisons
 */
export const getInternshipsForOG = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const ids = (req.query.ids as string)?.split(',') || [];

      if (ids.length === 0) {
        return res.status(400).json({ error: 'Internship IDs required' });
      }

      // Fetch multiple internships
      const internships = await Promise.all(
        ids.map(async (id) => {
          const doc = await admin.firestore().collection('internships').doc(id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        })
      );

      const validInternships = internships.filter((i) => i !== null);

      if (validInternships.length === 0) {
        return res.status(404).json({ error: 'No internships found' });
      }

      return res.json({
        count: validInternships.length,
        internships: validInternships,
      });
    } catch (error) {
      console.error('Error fetching internships:', error);
      return res.status(500).json({ error: 'Failed to fetch internship data' });
    }
  });
});
