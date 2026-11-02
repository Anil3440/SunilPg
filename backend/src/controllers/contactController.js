const ContactSetting = require('../models/ContactSetting');

// GET /api/contact
const getContact = async (req, res, next) => {
  try {
    let contact = await ContactSetting.findOne();
    if (!contact) {
      contact = await ContactSetting.create({});
    }
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// PUT /api/contact — admin only
const updateContact = async (req, res, next) => {
  try {
    const {
      wardenName,
      phone,
      emergencyPhone,
      whatsapp,
      email,
      officeHours,
      address,
      notice,
    } = req.body;

    let contact = await ContactSetting.findOne();
    if (!contact) {
      contact = new ContactSetting();
    }

    if (wardenName !== undefined) contact.wardenName = wardenName;
    if (phone !== undefined) contact.phone = phone;
    if (emergencyPhone !== undefined) contact.emergencyPhone = emergencyPhone;
    if (whatsapp !== undefined) contact.whatsapp = whatsapp;
    if (email !== undefined) contact.email = email;
    if (officeHours !== undefined) contact.officeHours = officeHours;
    if (address !== undefined) contact.address = address;
    if (notice !== undefined) contact.notice = notice;

    await contact.save();
    res.json({
      success: true,
      message: 'Contact details updated successfully',
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContact, updateContact };

