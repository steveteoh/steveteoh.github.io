## Welcome to Steve Teoh's Public Health Monitoring Repo - Infectious Diseases

Last Updated: 01/01/2024
<br/>Created:  

Welcome to Steve Teoh's public health github page. This page highlights the shared sources available in _https://steveteoh.github.io/diseases/_ for demo and educational purposes.<br>
It is a public-domain CSR with National Institute of Health to help monitor the spread of infectious diseases.

### Coverage
The following infectious diseases are covered:<br>
[1. Covid-19](https://steveteoh.github.io/diseases/covid/)<br>
![Klang Valley Covid-19](https://steveteoh.github.io/img/klangvalley.jpg)<br>
[2. Dengue](https://steveteoh.github.io/diseases/dengue/)<br>
[3. Tuberculosis](https://steveteoh.github.io/diseases/tuberculosis/)<br>
![Klang Valley Tuberculosis](https://steveteoh.github.io/img/kvtb.jpg) <br>
[4. Hand, Foot and Mouth Disease(HFMD)](https://steveteoh.github.io/diseases/hfmd/)<br>
[5. Measles](https://steveteoh.github.io/diseases/measles/)<br>
[6. Human Rabies](https://steveteoh.github.io/diseases/rabies/)<br>
[7. Animal Rabies](https://steveteoh.github.io/diseases/animal-rabies/)<br>

### Map Data Source
Map Data Last Updated: 01/01/2024<br>
The active cases data is sourced from mysejahtera app through api lookup. Contact the [author](mailto:chteoh@ieee.org?subject=Mysejahtera "Mysejahtera") for info about how to extract data from mysejahtera.<br>
Note: 
Latest Mysejahtera json format as of 27/9/2022 (changes in the sequence of elements):
```
{"hotSpots":[
{"disease":"RABIES","displayName":{"enUS":"Human Rabies","msMY":"Rabies dalam manusia"},"iconUri":"/hotspot/icons/rabies.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":90},
{"disease":"TB","displayName":{"enUS":"Tuberculosis","msMY":"Tibi"},"iconUri":"/hotspot/icons/TB.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":60},
{"disease":"DENGUE","displayName":{"enUS":"Dengue","msMY":"Denggi"},"iconUri":"/hotspot/icons/dengue.svg","activeCases":0,"radiusInMeters":200.0,"durationInDays":14},
{"disease":"ANIMAL_RABIES","displayName":{"enUS":"Animal Rabies","msMY":"Rabies dalam haiwan"},"iconUri":"/hotspot/icons/rabiesCircle.svg","activeCases":0,"radiusInMeters":5000.0,"durationInDays":180},
{"disease":"HFMD","displayName":{"enUS":"Hand, Foot & Mouth Disease","msMY":"Penyakit Tangan, Kaki & Mulut?"},"iconUri":"/hotspot/icons/HFMD.svg","activeCases":0,"radiusInMeters":5000.0,"durationInDays":7},
{"disease":"COVID-19","displayName":{"enUS":"COVID-19","msMY":"COVID-19"},"iconUri":"/hotspot/icons/COVID19.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":14},
{"disease":"MEASLES","displayName":{"enUS":"Measles","msMY":"Demam Campak"},"iconUri":"/hotspot/icons/measles.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":25}
]}
```
<br>

### Built With

- Google Maps API
- JavaScript
- node.js (server version is not included here)
- Visual Studio Code
- HTML
- CSS

### 🤝 Contribution and Support
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Version History
Hex Map for Malaysia - latest revision is 4.5.
Note: Kindly email me on the link below if you wish to have the raw code. 

### License
[MIT](https://steveteoh.github.io/diseases/animal-rabies/LICENSE)

#### Author
**Steve Teoh** (B.S, MSc, PhD, PTech, MIET, SMIEEE)

### Issues and Contact
Kindly contact Steve Teoh at [@teohcheehooi](https://twitter.com/teohcheehooi) or email to [Steve](mailto:chteoh@ieee.org?subject=Map "Map")
