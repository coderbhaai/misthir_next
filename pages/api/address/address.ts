
import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { getUserIdFromToken, log } from '../utils';
import Country from 'lib/models/address/Country';
import State from 'lib/models/address/State';
import City from 'lib/models/address/City';
import Address from 'lib/models/address/Address';

// Country
  export async function get_all_country(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Country.find().exec();
      return res.status(200).json({ message: 'Fetched all Country', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_country(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid or missing ID' });
      }
    
      const entry = await Country.findById(id).exec();
    
      if (!entry) { return res.status(404).json({ message: `Country with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_country(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Country.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              capital: data.capital,
              code: data.code,
              calling_code: data.calling_code,
              flag: data.flag,
              status: data.status,
              displayOrder: data.displayOrder,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (updated) {
            return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
          } else {
            return res.status(404).json({ message: '❌ Entry not found for update' });
          }
        } catch (error) { return log(error); }
      }

      const newEntry = new Country({
        name: data.name,
        capital: data.capital,
        code: data.code,
        calling_code: data.calling_code,
        flag: data.flag,
        status: data.status,
        displayOrder: data.displayOrder,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_country_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Country.find().select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all Country', data });
    } catch (error) { return log(error); }
  }
// Country

// State
  export async function get_all_state(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await State.find().populate('country_id').exec();
      return res.status(200).json({ message: 'Fetched all State', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_state(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid or missing ID' });
      }
    
      const entry = await State.findById(id).populate('country_id').exec();
    
      if (!entry) { return res.status(404).json({ message: `State with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_state(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await State.findByIdAndUpdate(
            modelId,
            {
              country_id: data.country_id,
              name: data.name,
              status: data.status,
              displayOrder: data.displayOrder,
              major: data.major,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (updated) {
            return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
          } else {
            return res.status(404).json({ message: '❌ Entry not found for update' });
          }
        } catch (error) { return log(error); }
      }

      const newEntry = new State({
        country_id: data.country_id,
        name: data.name,
        status: data.status,
        displayOrder: data.displayOrder,
        major: data.major,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_state_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await State.find().select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all State', data });
    } catch (error) { return log(error); }
  }

  export async function get_states_of_country(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = await State.find({country_id : req.body.country_id}).select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all State', data });
    } catch (error) { return log(error); }
  }
// Country

// City
  export async function get_all_city(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await City.find().populate({ path: 'state_id', populate: { path: 'country_id' } }).exec();
      return res.status(200).json({ message: 'Fetched all City', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_city(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid or missing ID' });
      }
    
      const entry = await City.findById(id).populate({ path: 'state_id', populate: { path: 'country_id' } }).exec();
    
      if (!entry) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data: entry });

    }catch (error) { return log(error); }
  };

  export async function create_update_city(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;
      if (!data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await City.findByIdAndUpdate(
            modelId,
            {
              state_id: data.state_id,
              name: data.name,
              status: data.status,
              displayOrder: data.displayOrder,
              major: data.major,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (updated) {
            return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
          } else {
            return res.status(404).json({ message: '❌ Entry not found for update' });
          }
        } catch (error) { return log(error); }
      }

      const newEntry = new City({
        state_id: data.state_id,
        name: data.name,
        status: data.status,
        displayOrder: data.displayOrder,
        major: data.major,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_cities_of_state(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = await City.find({state_id : req.body.state_id}).select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all Cities', data });
    } catch (error) { return log(error); }
  }
// City

// Address
  export async function get_my_addresses(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user_id = getUserIdFromToken(req);
      
      const data = await Address.find({ user_id })
        .populate({
          path: 'city_id',
          select: '_id name state_id',
          populate: {
            path: 'state_id',
            select: '_id name country_id',
            populate: { path: 'country_id', select: '_id name' }
          }
        }).exec();

      return res.status(200).json({ message: 'Fetched all Addresses of a User', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_address(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;

      const id = data.id;
      if (!id) return res.status(400).json({ message: 'ID MIssing', data: false });

      const user_id = data.user_id;
      if (!user_id) return res.status(400).json({ message: 'User ID MIssing', data: false });
      
      const singleAddress = await Address.findOne({ _id: id, user_id }).populate([
          { path: 'user_id', select: '_id name email phone' },
          {
            path: 'city_id',
            select: '_id name state_id',
            populate: {
              path: 'state_id',
              select: '_id name country_id',
              populate: { path: 'country_id', select: '_id name' }
            }
          }]).exec();

      return res.status(200).json({ message: 'Fetched all City', data: singleAddress });
    } catch (error) { return log(error); }
  }

  export async function create_update_address(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
      
      const data = req.body;
      if (!data?.first_name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }
      
      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      const user_id = data.user_id || getUserIdFromToken(req);

      let cityId = data.city_id;

      if (!cityId && data.city_new) {
        if (!data.state_id) { return res.status(400).json({ message: '❌ state_id is required to create or find a new city' }); }

        let city = await City.findOne({ name: data.city_new, state_id: data.state_id });

        if (!city) {
          city = new City({
            state_id: data.state_id,
            name: data.city_new,
            status: true,
            createdAt: new Date(),
          });

          city = await city.save();
        }

        cityId = city._id.toString();
      }

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await Address.findByIdAndUpdate(
            modelId,
            {
              user_id: user_id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone: data.phone,
              whatsapp: data.whatsapp,
              city_id: cityId,
              address1: data.address1,
              address2: data.address2,
              pin: data.pin,
              landmark: data.landmark,
              company: data.company,
              status: data.status,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (updated) {
            return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
          } else {
            return res.status(404).json({ message: '❌ Entry not found for update' });
          }
        } catch (error) { return log(error); }
      }

      const newEntry = new Address({
        user_id: user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        city_id: cityId,
        address1: data.address1,
        address2: data.address2,
        pin: data.pin,
        landmark: data.landmark,
        company: data.company,
        status: data.status,
        createdAt: new Date(),
      });
      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_all_addresses(req: NextApiRequest, res: NextApiResponse) {
    try {      
      const data = await Address.find()
        .populate([
          { path: 'user_id', select: '_id name email phone' },
          {
          path: 'city_id',
          select: '_id name state_id',
          populate: {
            path: 'state_id',
            select: '_id name country_id',
            populate: { path: 'country_id', select: '_id name' }
          }
        }]).exec();

      return res.status(200).json({ message: 'Fetched all Addresses', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_address_id_selected(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

      const data = req.body;

      const id = data.id;
      if (!id) return res.status(400).json({ message: 'ID MIssing', data: false });
      
      const singleAddress = await Address.findOne({ _id: id }).populate([
          { path: 'user_id', select: '_id name email phone' },
          {
            path: 'city_id',
            select: '_id name state_id',
            populate: {
              path: 'state_id',
              select: '_id name country_id',
              populate: { path: 'country_id', select: '_id name' }
            }
          }]).exec();

      return res.status(200).json({ message: 'Fetched all City', data: singleAddress });
    } catch (error) { return log(error); }
  }
// Address

const functions = {
  get_all_country,
  get_single_country,
  create_update_country,
  get_country_options,
  
  get_all_state,
  get_single_state,
  create_update_state,
  get_state_options,
  get_states_of_country,

  get_all_city,
  get_single_city,
  create_update_city,
  get_cities_of_state,

  get_my_addresses,
  get_single_address,
  create_update_address,
  get_all_addresses,
  get_single_address_id_selected

};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);