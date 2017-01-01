from indicamera import INDICamera
from indiclient import INDIClient
from astropy.io import fits
from datetime import datetime
import os
import scipy.misc
from glob import glob

class INDIController:
    def __init__(self):
        self.client = INDIClient()


    def devices(self):
        properties = self.client.get_properties()
        devices = list(set([property['device'] for property in properties]))
        devices.sort()
        return devices

    def properties(self, device):
       return self.client.get_properties(device) 

    def property(self, device, property):
        property_element = property.split('.')
        return self.client.get_properties(device, property_element[0], property_element[1])[0]

    def set_property(self, device, property, value):
        property_element = property.split('.')
        self.client.set_property_sync(device, property_element[0], property_element[1], value)
        return self.property(device, property)

    def preview(self, device, exposure, workdir):
        imager = INDICamera(device, self.client)
        if not imager.is_connected():
            imager.connect()
        imager.set_output(workdir, 'IMAGE_PREVIEW')
        imager.shoot(exposure)
        current_file_name = 'preview-{0}.jpg'.format(datetime.utcnow().isoformat())
        current_file = '{0}/{1}'.format( workdir, current_file_name )
        scipy.misc.imsave(current_file, fits.getdata(workdir + '/IMAGE_PREVIEW.fits'))
        self.__clean(workdir)
        return current_file_name

    def __clean(self, workdir):
        for file in sorted(glob('{0}/preview-*.jpg'.format(workdir)))[:-3]:
                os.remove(file)

