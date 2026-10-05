import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import * as React from 'react';
import { useState, useEffect } from 'react';

type Props = {
  dataId: string;
};

export default function SellerServiceAreas({ dataId }: Props) {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const countryRes = await apiRequest("POST", 'address/address', { 
          function: 'get_country_options', 
          limit: 1000
        });
        setCountries(countryRes?.data || []);

        const res = await apiRequest("POST", 'ecom/commission', { 
          function: 'get_all_seller_service_area', 
          seller_id: dataId
        });

        setSelectedCountries( res?.data?.filter((i: any) => i.module === 'Country').map((i: any) => i.module_id?._id) );
        setSelectedStates( res?.data?.filter((i: any) => i.module === 'State').map((i: any) => i.module_id?._id) );
        setSelectedCities( res?.data?.filter((i: any) => i.module === 'City').map((i: any) => i.module_id?._id) );
      } catch (error) { clo(error); } finally { setLoading(false); }
    }
    fetchData();
  }, [dataId]);

  useEffect(() => {
    if (selectedCountries.length === 0) { setStates([]); setSelectedStates([]); setCities([]); setSelectedCities([]); return; }

    async function fetchStates() {
      const res = await apiRequest("POST", 'address/address', { 
        function: 'get_state_options',
        parent_id: selectedCountries,
        limit: 1000
      });
      setStates(res?.data || []);
    }
    fetchStates();
  }, [selectedCountries]);

  useEffect(() => {
    if (selectedStates.length === 0 && selectedCountries.length === 0) { setCities([]); setSelectedCities([]); return; }

    async function fetchCities() {
      const res = await apiRequest("POST", 'address/address', { 
        function: 'get_city_options',
        countries: selectedCountries,
        states: selectedStates,
        limit: 1000
      });
      setCities(res?.data || []);
    }
    fetchCities();
  }, [selectedStates, selectedCountries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_seller_service_area");
      formDataToSend.append("seller_id", dataId);
      formDataToSend.append("country_ids", JSON.stringify(selectedCountries));
      formDataToSend.append("state_ids", JSON.stringify(selectedStates));
      formDataToSend.append("city_ids", JSON.stringify(selectedCities));
      const res = await apiRequest("POST", `ecom/commission`, formDataToSend);

      if( res?.data ){
        hitToastr('success', res?.message);
      }
    } catch (error) { clo(error); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading service areas...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Seller Service Areas</h2>

      <form onSubmit={handleSubmit} className="">
        <div className="row">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Countries (Select one or more)</label>
            <div className="overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              {countries.map((c) => (
                <label key={c._id} className="flex items-center space-x-2">
                  <input type="checkbox" value={c._id} checked={selectedCountries.includes(c._id)} onChange={(e) => { const value = e.target.value; setSelectedCountries((prev) => e.target.checked ? [...prev, value] : prev.filter((id) => id !== value)); }} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <span className="text-sm text-gray-800">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {states.length > 0 && (
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">States (Select specific states for delivery)</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {states.map((st) => (
                  <label key={st._id} className="flex items-center space-x-2">
                    <input type="checkbox" value={st._id} checked={selectedStates.includes(st._id)} onChange={(e) => { const value = e.target.value; setSelectedStates((prev) => e.target.checked ? [...prev, value] : prev.filter((id) => id !== value)); }} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <span className="text-sm text-gray-800">{st.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {cities.length > 0 && (
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cities (Select specific cities for delivery)</label>
              <div className="overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {cities.map((ct) => (
                  <label key={ct._id} className="flex items-center space-x-2">
                    <input type="checkbox" value={ct._id} checked={selectedCities.includes(ct._id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onChange={(e) => { const value = e.target.value; setSelectedCities((prev) => e.target.checked ? [...prev, value] : prev.filter((id) => id !== value)); }}/>
                    <span className="text-sm text-gray-800">{ct.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn mt-5">{saving ? 'Saving...' : 'Save Service Areas'}</button>
      </form>
    </div>
  );
}