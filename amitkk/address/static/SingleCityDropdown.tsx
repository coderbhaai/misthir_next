"use client";

import React, { useState } from "react";
import CityDataModal from "../admin/city-modal";
import AddActionButton from "@amitkk/components/ui/AddSideActionButton";
import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";

interface City {
  _id: string;
  name?: string;
}

type Props = {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  countryId?: string | string[] | null;
  stateId?: string | string[] | null;
};

export default function SingleCityDropdown({
  value,
  onChange,
  required,
  disabled,
  countryId,
  stateId,
  fullWidth = false
}: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const canAddCity = !!countryId && !!stateId && !disabled;
  const cleanCountryId = Array.isArray(countryId) ? countryId[0] : (countryId || null);
  const cleanStateId = Array.isArray(stateId) ? stateId[0] : (stateId || null);

  const handleCityCreated = async (newCity: any) => {
    setRefreshKey((prev) => prev + 1);
    setOpenModal(false);

    if (newCity && newCity._id) {
      onChange(newCity._id); 
    }
  };

  return (
    <>
      <div className="flex items-end gap-2 w-full">
        <div className="flex-1">
          <SingleAsyncDropdown<City>
            key={`city-dropdown-refresh-${refreshKey}`}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            label="City"
            endpoint="address/address"
            listFunction="get_city_options"
            singleFunction="get_single_city"
            filters={{
              countries: cleanCountryId,
              states: cleanStateId,
            }}
            getOptionLabel={(o) => o?.name || ""}
            renderFooter={(closeMenu) => (
              <AddActionButton variant="menuItem" title="Add New City..." disabled={!canAddCity} onClick={() => { closeMenu(); setOpenModal(true); }}/>
            )}
          />
        </div>

        {canAddCity && ( <AddActionButton variant="icon" title="Add New City" onClick={() => setOpenModal(true)}/>)}
      </div>

      {openModal && (
        <CityDataModal open={openModal} handleClose={() => setOpenModal(false)} selectedDataId={null} handleUpdate={handleCityCreated} countryId={cleanCountryId} stateId={cleanStateId}  fullWidth={fullWidth}/>
      )}
    </>
  );
}