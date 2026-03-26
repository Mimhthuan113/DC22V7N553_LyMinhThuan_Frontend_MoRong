const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
exports.create = async (req, res, next) => {
  if (!req.body?.name) {
    return res.status(400).json({ message: "Name can not be empty" });
  }
  try {
    const contacts = new ContactService(MongoDB.client);
    const document = await contacts.create(req.body);
    return res.json(document);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the contact." });
  }
};
exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const contacts = new ContactService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await contacts.findByName(name);
    } else {
      documents = await contacts.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving contacts."),
    );
  }
  return res.json(documents);
};
exports.findOne = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  try {
    const contacts = new ContactService(MongoDB.client);
    const document = await contacts.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.json({ message: "Contact was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating contact with id=${req.params.id}`),
    );
  }
};
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  try {
    const contacts = new ContactService(MongoDB.client);
    const document = await contacts.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.json({ message: "Contact was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating contact with id=${req.params.id}`),
    );
  }
};
exports.delete = async (req, res, next) => {
  try {
    const contacts = new ContactService(MongoDB.client);
    const document = await contacts.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.json({ message: "Contact was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error deleting contact with id=${req.params.id}`),
    );
  }
};
exports.deleteAll = async (_req, res, next) => {
  try {
    const contacts = new ContactService(MongoDB.client);
    const deletedCount = await contacts.deleteAll();
    return res.json({
      message: `${deletedCount} contacts were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all contacts."),
    );
  }
};
exports.findAllFavorite = async (_req, res, next) => {
  try {
    const contacts = new ContactService(MongoDB.client);
    const documents = await contacts.findFavorite();
    return res.json(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "An error occurred while retrieving favorite contacts.",
      ),
    );
  }
};
