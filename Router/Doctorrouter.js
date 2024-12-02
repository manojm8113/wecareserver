const router = require('express').Router();
const multer = require('multer');
const cryptojs = require('crypto-js');
const DoctorSchema = require('../Model/DoctorsSchema');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../client/src/Images'); // Adjust this path based on your project structure
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/addDoctor', upload.single("image"), async (req, res) => {
    req.body.password = Cryptojs.AES.encrypt(req.body.password, process.env.crypto).toString();
    const { doctorname, section, email, phone, description, password } = req.body;
    const imageName = req.file.filename;

    try {
        if (!doctorname || !section || !email || !phone || !description || !password) {
            return res.status(400).json({ error: "required fields are missing" });
        }

        await DoctorSchema.create({
            image: imageName,
            doctorname,
            section,
            email,
            phone,
            description,
            password
        });

        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.json({ status: error });
    }
});

router.get("/getDoctor", async (req, res) => {
    try {
        const data = await DoctorSchema.find({});
        res.status(200).json(data);
    } catch (error) {
        res.json({ status: error });
    }
});

router.get('/GetDoctor/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const doctor = await DoctorSchema.findById(id);
      if (!doctor) {
        return res.status(404).send('Doctor not found');
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });
  

router.delete('/deletedoctor/:id', async (req, res) => {
    try {
        const product = await DoctorSchema.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ message: 'Doctor Data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Doctor', error });
    }
});
router.put('/updateData/:id', async (req, res) => {
    console.log("Updating Doctor by ID:", req.params.id);
    try {
        const updatedDoctor = await DoctorSchema.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedDoctor);
    } catch (err) {
        console.error("Update Doctor error:", err);
        res.status(500).json("Internal server error");
    }
});
module.exports = router;
