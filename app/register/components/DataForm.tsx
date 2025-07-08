'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Input,
  Separator,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getYear, getMonth } from 'date-fns';

export const DataForm = ({
  initialFormData,
  onFormDataChange,
}: {
  initialFormData: {
    nickname: string;
    birthdate: Date | null;
    location: string;
    gender: string;
    school: string;
    grade: string;
    days: number;
    daily_count: number;
    first_dashboard_today: boolean;
  };
  onFormDataChange: (data: any) => void;
}) => {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    onFormDataChange(formData);
  }, [formData, onFormDataChange]);

  const locationOptions = ['Főváros', 'Megyeszékhely', 'Város', 'Falu'];
  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => 1900 + i
  );
  const months = [
    'Január',
    'Február',
    'Március',
    'Április',
    'Május',
    'Június',
    'Július',
    'Augusztus',
    'Szeptember',
    'Október',
    'November',
    'December',
  ];
  const days: Record<string, string> = {
    Mo: 'Hét',
    Tu: 'Ked',
    We: 'Sze',
    Th: 'Csü',
    Fr: 'Pén',
    Sa: 'Szo',
    Su: 'Vas',
  };

  const isMobile = useBreakpointValue({ base: true, sm: false });

  return isMobile ? (
    <>
      {/* Nickname */}
      <Box>
        <Text fontWeight="medium" mb={2}>
          Gyermek beceneve
        </Text>
        <Input
          bg="white"
          fontSize="md"
          placeholder="Adja meg a becenevet"
          _selection={{ backgroundColor: 'brand.100' }}
          value={formData.nickname}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nickname: e.target.value }))
          }
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius="md"
          _focus={{ borderColor: 'blue.400' }}
          _hover={{ borderColor: 'gray.400' }}
          required
        />
      </Box>
      <Separator width="full" borderColor="gray.200" my="-3" mx="auto" />
      {/* Gender */}
      <Box>
        <Text fontWeight="medium" mb={2}>
          Gyermek neme
        </Text>
        <Flex gap={2} direction="column" wrap="wrap">
          {[
            { value: 'male', label: 'Fiú' },
            { value: 'female', label: 'Lány' },
            { value: 'preferNot', label: 'Nem kívánok válaszolni' },
          ].map((option) => (
            <Flex key={option.value} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option.value}
                name="gender"
                value={option.value}
                checked={formData.gender === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
              />
              <label htmlFor={option.value}>{option.label}</label>
            </Flex>
          ))}
        </Flex>
      </Box>
      <Separator width="full" borderColor="gray.200" my="-3" mx="auto" />
      {/* Birthdate */}
      <Box>
        <Text
          _selection={{ backgroundColor: 'brand.100' }}
          fontWeight="medium"
          mb={2}
        >
          Születési ideje
        </Text>
        <Box
          fontSize="md"
          border="1px"
          borderColor="gray.300"
          borderRadius="md"
          p={2}
          bg="white"
          width="fit-content"
          _focusWithin={{ borderColor: 'blue.400' }}
        >
          <DatePicker
            placeholderText="Adja meg a dátumot"
            selected={formData.birthdate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, birthdate: date }))
            }
            dateFormat="yyyy-MM-dd"
            calendarStartDay={1}
            formatWeekDay={(day: any) => days[day.slice(0, 2)]}
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            required
            renderCustomHeader={(props: {
              date: Date;
              changeYear: (year: number) => void;
              changeMonth: (month: number) => void;
              decreaseMonth: () => void;
              increaseMonth: () => void;
              prevMonthButtonDisabled: boolean;
              nextMonthButtonDisabled: boolean;
            }) => (
              <div
                style={{
                  margin: 10,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={props.decreaseMonth}
                  disabled={props.prevMonthButtonDisabled}
                >
                  {'<'}
                </button>
                <select
                  value={getYear(props.date)}
                  onChange={({ target: { value } }) =>
                    props.changeYear(Number(value))
                  }
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={months[getMonth(props.date)]}
                  onChange={({ target: { value } }) =>
                    props.changeMonth(months.indexOf(value))
                  }
                >
                  {months.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  onClick={props.increaseMonth}
                  disabled={props.nextMonthButtonDisabled}
                >
                  {'>'}
                </button>
              </div>
            )}
          />
        </Box>
      </Box>
      <Separator width="full" borderColor="gray.200" my="-3" mx="auto" />
      {/* Location */}
      <Box>
        <Text fontWeight="medium" mb={2}>
          Lakóhely típusa
        </Text>
        <Flex gap={2} direction="column" wrap="wrap">
          {locationOptions.map((option) => (
            <Flex key={option} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option}
                name="location"
                value={option}
                checked={formData.location === option}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
              <label htmlFor={option}>{option}</label>
            </Flex>
          ))}
        </Flex>
      </Box>
      <Separator width="full" borderColor="gray.200" my="-3" mx="auto" />
      {/* Type of Education */}
      <Box>
        <Text fontWeight="medium" mb={2}>
          Milyen oktatási intézménybe jár a gyermek?
        </Text>
        <Flex gap={2} direction="column" wrap="wrap">
          {[
            { value: 'Iskola', label: 'Általános iskola' },
            { value: 'Óvoda', label: 'Óvoda' },
          ].map((option) => (
            <Flex key={option.value} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option.value}
                name="school"
                value={option.value}
                checked={formData.school === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, school: e.target.value }))
                }
              />
              <label htmlFor={option.value}>{option.label}</label>
            </Flex>
          ))}
        </Flex>
      </Box>
      <Separator width="full" borderColor="gray.200" my="-3" mx="auto" />

      {/* Class Selection (Conditional) */}
      {formData.school === 'Iskola' && (
        <Box>
          <Text
            _selection={{ backgroundColor: 'brand.100' }}
            fontWeight="medium"
            mb={2}
          >
            Hanyadik osztályba jár a gyermek? (ha iskolás)
          </Text>
          <Input
            fontSize="md"
            required
            bg="white"
            placeholder="Adja meg az osztály számát"
            value={formData.grade}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, grade: e.target.value }))
            }
            borderWidth="1px"
            borderColor="gray.300"
            borderRadius="md"
            _focus={{ borderColor: 'blue.400' }}
          />
        </Box>
      )}
    </>
  ) : (
    <Grid templateColumns={{ base: '1fr', md: '3fr 5fr' }} mx="4" gap={4}>
      {/* Nickname */}
      <GridItem>
        <Text fontWeight="medium">Gyermek beceneve</Text>
      </GridItem>
      <GridItem>
        <Input
          bg="white"
          fontSize="md"
          placeholder="Adja meg a becenevet"
          value={formData.nickname}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nickname: e.target.value }))
          }
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius="md"
          _focus={{ borderColor: 'blue.400' }}
          _hover={{ borderColor: 'gray.400' }}
          required
        />
      </GridItem>
      <GridItem colSpan={2}>
        <Separator width="full" borderColor="gray.200" mx="auto" />
      </GridItem>

      {/* Gender */}
      <GridItem>
        <Text fontWeight="medium">Gyermek neme</Text>
      </GridItem>
      <GridItem>
        <Flex gap={2} direction="column" wrap="wrap">
          {[
            { value: 'male', label: 'Fiú' },
            { value: 'female', label: 'Lány' },
            { value: 'preferNot', label: 'Nem kívánok válaszolni' },
          ].map((option) => (
            <Flex key={option.value} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option.value}
                name="gender"
                value={option.value}
                checked={formData.gender === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
              />
              <label htmlFor={option.value}>{option.label}</label>
            </Flex>
          ))}
        </Flex>
      </GridItem>
      <GridItem colSpan={2}>
        <Separator width="full" borderColor="gray.200" mx="auto" />
      </GridItem>
      {/* Birthdate */}
      <GridItem>
        <Text fontWeight="medium">Születési ideje</Text>
      </GridItem>
      <GridItem>
        <Box
          fontSize="md"
          border="1px"
          borderColor="gray.300"
          borderRadius="md"
          p={2}
          bg="white"
          width="fit-content"
          _focusWithin={{ borderColor: 'blue.400' }}
        >
          <DatePicker
            placeholderText="Adja meg a dátumot"
            selected={formData.birthdate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, birthdate: date }))
            }
            dateFormat="yyyy-MM-dd"
            calendarStartDay={1}
            formatWeekDay={(day: any) => days[day.slice(0, 2)]}
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            required
            renderCustomHeader={(props: {
              date: Date;
              changeYear: (year: number) => void;
              changeMonth: (month: number) => void;
              decreaseMonth: () => void;
              increaseMonth: () => void;
              prevMonthButtonDisabled: boolean;
              nextMonthButtonDisabled: boolean;
            }) => (
              <div
                style={{
                  margin: 10,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={props.decreaseMonth}
                  disabled={props.prevMonthButtonDisabled}
                >
                  {'<'}
                </button>
                <select
                  value={getYear(props.date)}
                  onChange={({ target: { value } }) =>
                    props.changeYear(Number(value))
                  }
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={months[getMonth(props.date)]}
                  onChange={({ target: { value } }) =>
                    props.changeMonth(months.indexOf(value))
                  }
                >
                  {months.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  onClick={props.increaseMonth}
                  disabled={props.nextMonthButtonDisabled}
                >
                  {'>'}
                </button>
              </div>
            )}
          />
        </Box>
      </GridItem>
      <GridItem colSpan={2}>
        <Separator width="full" borderColor="gray.200" mx="auto" />
      </GridItem>
      {/* Location */}
      <GridItem>
        <Text fontWeight="medium">Lakóhely típusa</Text>
      </GridItem>
      <GridItem>
        <Flex gap={0} direction="column" wrap="wrap">
          {locationOptions.map((option) => (
            <Flex key={option} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option}
                name="location"
                value={option}
                checked={formData.location === option}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
              <label htmlFor={option}>{option}</label>
            </Flex>
          ))}
        </Flex>
      </GridItem>
      <GridItem colSpan={2}>
        <Separator width="full" borderColor="gray.200" mx="auto" />
      </GridItem>
      {/* School */}
      <GridItem>
        <Text fontWeight="medium">Milyen oktatási intézménybe jár?</Text>
      </GridItem>
      <GridItem>
        <Flex gap={0} direction="column" wrap="wrap">
          {[
            { value: 'Iskola', label: 'Általános iskola' },
            { value: 'Óvoda', label: 'Óvoda' },
          ].map((option) => (
            <Flex key={option.value} align="center" gap={2} marginRight="6">
              <input
                required
                type="radio"
                id={option.value}
                name="school"
                value={option.value}
                checked={formData.school === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, school: e.target.value }))
                }
              />
              <label htmlFor={option.value}>{option.label}</label>
            </Flex>
          ))}
        </Flex>
      </GridItem>
      <GridItem colSpan={2}>
        <Separator width="full" borderColor="gray.200" mx="auto" />
      </GridItem>
      {/* Grade (if applicable) */}
      {formData.school === 'Iskola' && (
        <>
          <GridItem>
            <Text fontWeight="medium">Hanyadik osztályba jár a gyermek?</Text>
          </GridItem>
          <GridItem>
            <Input
              fontSize="md"
              bg="white"
              placeholder="Adja meg az osztály számát"
              value={formData.grade}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, grade: e.target.value }))
              }
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="md"
              _focus={{ borderColor: 'blue.400' }}
            />
          </GridItem>
        </>
      )}
    </Grid>
  );
};
