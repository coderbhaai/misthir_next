import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { checkNullValue, logError, normalizeError, safeParse } from '../utils';
import Country from 'lib/models/address/Country';
import State from 'lib/models/address/State';
import City from 'lib/models/address/City';
import Address from 'lib/models/address/Address';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import { getUserIdFromToken } from '../basic/auth';
import { getUsersIdByEmail } from '../basic/spatie';

// Country
  export async function get_filtered_country(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await Country.countDocuments(matchQuery);
      
      const data = await Country.find(matchQuery).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Country', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_country", payload: req.body }); }
  }

  export async function get_single_country(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;    
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
      const data = await Country.findById(id).exec();
      if (!data) { return res.status(404).json({ message: `Country with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    }catch (error) { await logError(error, { function: "get_single_country", payload: req.body }); }
  };

  export async function create_update_country(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
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
              site: data.site,
              displayOrder: checkNullValue(data.displayOrder),
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "create_update_country", payload: req.body }); }
      }

      const newEntry = new Country({
        name: data.name,
        capital: data.capital,
        code: data.code,
        calling_code: data.calling_code,
        flag: data.flag,
        status: data.status,
        site: data.site,
        displayOrder: checkNullValue(data.displayOrder),
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_country", payload: req.body }); }
  }

  export async function get_country_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { search = "", limit = 20 } = req.body;
      const query: any = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const data = await Country.find(query).select("_id name").sort({ displayOrder: -1 }).limit(limit).lean();

      return res.status(200).json({ message: 'Fetched all Country', data });
    } catch (error) { await logError(error, { function: "get_country_options", payload: req.body }); }
  }

  export async function get_country_site_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await Country.find({ site:true }).exec();
      return res.status(200).json({ message: 'Fetched all Country', data });
    } catch (error) { await logError(error, { function: "get_country_site_options", payload: req.body }); }
  }
// Country

// State
  export async function get_filtered_state(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await State.countDocuments(matchQuery);

      const data = await State.find(matchQuery).populate('country_id').skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all State', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) }  });
    } catch (error) { await logError(error, { function: "get_filtered_state", payload: req.body }); }
  }

  export async function get_single_state(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;    
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
      const data = await State.findById(id).populate('country_id').exec();
      if (!data) { return res.status(404).json({ message: `State with ID ${id} not found` }); }
    
      return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    }catch (error) { await logError(error, { function: "get_single_state", payload: req.body }); }
  };

  export async function create_update_state(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await State.findByIdAndUpdate(
            modelId,
            {
              country_id: data.country_id,
              name: data.name,
              status: data.status,
              displayOrder: checkNullValue(data.displayOrder),
              major: data.major,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "create_update_state", payload: req.body }); }
      }

      const newEntry = new State({
        country_id: data.country_id,
        name: data.name,
        status: data.status,
        displayOrder: checkNullValue(data.displayOrder),
        major: data.major,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_state", payload: req.body }); }
  }

  export async function get_state_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      let { parent_id = [], search = "", limit = 20 } = req.body as {
        parent_id?: string[] | string;
        search?: string;
        limit?: number;
      };

      if (typeof parent_id === "string") {
        try {
          parent_id = JSON.parse(parent_id);
        } catch {
          parent_id = [];
        }
      }
      
      if (!Array.isArray(parent_id)) {
        parent_id = [];
      }

      const query: Record<string, any> = {};

      if (parent_id.length > 0) {
        query.country_id = { $in: parent_id };
      }

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const data = await State.find(query).select("_id name").limit(Number(limit) || 20).lean();
      return res.status(200).json({ message: "Fetched Cities", data });
    } catch (error) { await logError(error, { function: "get_state_options", payload: req.body }); }
  }

  export async function get_states_of_country(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await State.find({country_id : req.body.country_id}).select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all State', data });
    } catch (error) { await logError(error, { function: "get_states_of_country", payload: req.body }); }
  }
// Country

// City
  export async function get_filtered_city(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await City.countDocuments(matchQuery);
      
      const data = await City.find(matchQuery).populate([ { path: 'country_id' }, { path: 'state_id' }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all City', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) }  });
    } catch (error) { await logError(error, { function: "get_filtered_city", payload: req.body }); }
  }

  export async function get_single_city(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
      const data = await City.findById(id).populate([ { path: 'country_id' }, { path: 'state_id' }]).exec();
      if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }    

      return res.status(200).json({ message: '✅ Single Entry Fetched', data });
    }catch (error) { await logError(error, { function: "get_single_city", payload: req.body }); }
  };

  export async function create_update_city(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await City.findByIdAndUpdate(
            modelId,
            {
              country_id: data.country_id,
              state_id: data.state_id,
              name: data.name,
              status: data.status,
              displayOrder: checkNullValue(data.displayOrder),
              major: data.major,
              updatedAt: new Date(),
            },
            { new: true }
          );

          if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "create_update_city", payload: req.body }); }
      }

      const newEntry = new City({
        country_id: data.country_id,
        state_id: data.state_id,
        name: data.name,
        status: data.status,
        displayOrder: checkNullValue(data.displayOrder),
        major: data.major,
        createdAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_city", payload: req.body }); }
  }

  export async function get_cities_of_state(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await City.find({state_id : req.body.state_id}).select("_id name").exec();
      return res.status(200).json({ message: 'Fetched all Cities', data });
    } catch (error) { await logError(error, { function: "get_cities_of_state", payload: req.body }); }
  }

  export async function get_cities_of_country(req: NextApiRequest, res: NextApiResponse) {
    try {
      const countryIds = safeParse(req.body.countries || '[]');
      if (!countryIds || !Array.isArray(countryIds) || countryIds.length === 0) {
        return res.status(200).json({ message: "No countries provided", data: [] });
      }

      const states = await State.find({ country_id: { $in: countryIds } }).select("_id").lean();
      const stateIds = states.map((s: { _id: any; }) => s._id);

      const cities = await City.find({ state_id: { $in: stateIds } }).select("_id name").sort({ name: 1 }).lean();

      return res.status(200).json({ message: "Fetched Cities successfully", data: cities });
    } catch (error) { await logError(error, { function: "get_cities_of_country", payload: req.body }); }
  }

  export async function get_cities_of_india(req: NextApiRequest, res: NextApiResponse) {
    try {
      const country = await Country.findOne({ name: "India" }).select("_id");
      const states = await State.find({ country_id: { $in: country._id } }).select("_id").lean();
      const stateIds = states.map((s: { _id: any; }) => s._id);      

      const cities = await City.find({ state_id: { $in: stateIds } }).select("_id name").sort({ name: 1 }).lean();

      return res.status(200).json({ message: "Fetched Cities successfully", data: cities });
    } catch (error) { await logError(error, { function: "get_cities_of_india", payload: req.body }); }
  }

  export async function get_city_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      let { countries, states, search = "", limit = 20, } = req.body;

      const country_ids = safeParse(countries);
      const state_ids = safeParse(states);

      const query: any = {
        status: true,
      };

      if (state_ids.length) {
        query.state_id = { $in: state_ids };
      } else if (country_ids.length) {
        query.country_id = { $in: country_ids };
      }

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      if (!state_ids.length && !country_ids.length && !search) {
        return res.status(200).json({ data: [] });
      }

      const data = await City.find(query).select("_id name state_id country_id").sort({ displayOrder: 1, name: 1 }).limit(limit).lean();
      return res.status(200).json({ data });

    } catch (error) {
      await logError(error, { function: "get_city_options", payload: req.body });
      return res.status(500).json({ data: [] });
    }
  }
// City

// Address
  export async function get_my_addresses(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user_id = await getUserIdFromToken(req);
      
      const data = await Address.find({ user_id }).populate([ { path: 'user_id' }, { path: 'city_id', populate: { path: 'state_id', populate: { path: 'country_id' } }}]).exec();
      return res.status(200).json({ message: 'Fetched all Addresses of a User', data });
    } catch (error) { await logError(error, { function: "get_my_addresses", payload: req.body }); }
  }
  
  export async function get_single_address(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = req.body;

      const id = data.id;
      if (!id) return res.status(400).json({ message: 'ID MIssing', data: false });

      let user_id: string | null = null;
      if (data.admin === "true") {
        user_id = await getUsersIdByEmail("amit.khare588@gmail.com");
      } else {
        user_id = req.body.user_id || await getUserIdFromToken(req);
      }
      
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
    } catch (error) { await logError(error, { function: "get_single_address", payload: req.body }); }
  }

  export async function create_update_address(req: ExtendedRequest, res: NextApiResponse) {
    try {
      const data = req.body;      
      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      let user_id: string | null = null;

      if (data.admin === "true") {
        user_id = await getUsersIdByEmail("amit.khare588@gmail.com");
      } else {
        user_id = req.body.user_id || await getUserIdFromToken(req);
      }
      
      if (!user_id) { return res.status(400).json({ success: false, message: "User reference target could not be resolved." }); }

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
              name: data.name,
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

          if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { 
          await logError(error, { function: "create_update_address", payload: req.body }); 
          return res.status(500).json({ message: normalizeError(error) });
        }
      }

      const newEntry = new Address({
        user_id: user_id,
        name: data.name,
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
    }catch (error: any) { await logError(error, { function: "create_update_branch", payload: req.body }); }
  }

  export async function get_filtered_addresses(req: NextApiRequest, res: NextApiResponse) {
    try {   
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "url"] });
      const total = await Address.countDocuments(matchQuery);

      const data = await Address.find(matchQuery)
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
        }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });

      return res.status(200).json({ message: 'Fetched all Addresses', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) }  });
    } catch (error) { await logError(error, { function: "get_filtered_addresses", payload: req.body }); }
  }

  export async function get_single_address_id_selected(req: NextApiRequest, res: NextApiResponse) {
    try {
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
    } catch (error) { await logError(error, { function: "get_single_address_id_selected", payload: req.body }); }
  }

  export async function get_admin_addresses(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user_id = await getUsersIdByEmail("amit.khare588@gmail.com");
      
      const data = await Address.find({ user_id }).populate([ { path: 'user_id' }, { path: 'city_id', populate: { path: 'state_id', populate: { path: 'country_id' } }}]).exec();
      return res.status(200).json({ message: 'Fetched all Addresses of Admin', data });
    } catch (error) { await logError(error, { function: "get_admin_addresses", payload: req.body }); }
  }
// Address

export const functions: APIHandlers = {
  get_filtered_country : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/country" },
  get_single_country : { middlewares: [ "checkUserId", ], url: "/admin/country" },
  create_update_country : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "status" ] }} ], url: "/admin/country" },
  get_country_options : { middlewares: ["checkPostMethod",] },
  get_country_site_options : { middlewares: [] },
  
  get_filtered_state : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/state" },
  get_single_state : { middlewares: [ "checkUserId", ], url: "/admin/state" },
  create_update_state : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "country_id", "name", "status" ] }} ], url: "/admin/state" },
  get_state_options : { middlewares: ["checkPostMethod",] },
  get_states_of_country : { middlewares: [] },
  
  get_filtered_city :{ middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/city" },
  get_single_city : { middlewares: [ "checkUserId", ], url: "/admin/city" },
  create_update_city : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "country_id", "name", "status" ] }} ], url: "/admin/city" },
  get_cities_of_state : { middlewares: [ "checkUserId", "checkPostMethod" ], },
  get_cities_of_country : { middlewares: [ "checkUserId", "checkPostMethod" ], },
  get_cities_of_india : { middlewares: [ "checkUserId" ], },
  get_city_options : { middlewares: ["checkPostMethod",] },

  get_filtered_addresses : { middlewares: [ "checkUserId", "checkPostMethod" ], url: "/admin/address" },
  get_single_address : { middlewares: [ "checkUserId", ], url: "/admin/address" },
  create_update_address : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "phone", "address1", "pin", "status" ] }} ] },
  get_my_addresses : { middlewares: ["checkPostMethod",] },
  get_single_address_id_selected : { middlewares: [] },
  get_admin_addresses : { middlewares: [ "checkUserId", "checkPostMethod" ] },
};

export const addressHandlers = {
  get_filtered_country,
  get_single_country,
  create_update_country,
  get_country_options,
  get_country_site_options,
  
  get_filtered_state,
  get_single_state,
  create_update_state,
  get_state_options,
  get_states_of_country,

  get_filtered_city,
  get_single_city,
  create_update_city,
  get_cities_of_state,
  get_cities_of_country,
  get_cities_of_india,
  get_city_options,

  get_my_addresses,
  get_single_address,
  create_update_address,
  get_filtered_addresses,
  get_single_address_id_selected,
  get_admin_addresses,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, addressHandlers);